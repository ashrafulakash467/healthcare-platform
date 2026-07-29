"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

const initialFilters = {
  search: "",
  specialty: "",
  location: "",
  gender: "",
  availability: "",
  sort: "name_asc",
};

export default function FindDoctor() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [doctors, setDoctors] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    specialties: [],
    locations: [],
    genders: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 14,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
      sort: appliedFilters.sort,
    });

    for (const [key, value] of Object.entries(appliedFilters)) {
      if (value && key !== "sort") {
        params.set(key, value);
      }
    }

    return params.toString();
  }, [appliedFilters, pagination.limit, pagination.page]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDoctors() {
      setIsLoading(true);
      setError("");

      try {
        const response = await apiFetch(`/doctor/search?${queryString}`, {
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          setError(result.message ?? "Could not load doctors.");
          return;
        }

        setDoctors(result.data ?? []);
        setFilterOptions((currentFilterOptions) => result.filters ?? currentFilterOptions);
        setPagination((currentPagination) => ({
          ...currentPagination,
          ...(result.pagination ?? {}),
        }));
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError("Could not reach the API. Make sure the backend is running on port 3001.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDoctors();

    return () => controller.abort();
  }, [queryString]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setPagination((currentPagination) => ({ ...currentPagination, page: 1 }));
    setAppliedFilters(filters);
  }

  function selectSpecialty(specialty) {
    const nextFilters = { ...filters, specialty };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPagination((currentPagination) => ({ ...currentPagination, page: 1 }));
  }

  function clearFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPagination((currentPagination) => ({ ...currentPagination, page: 1 }));
  }

  function goToPage(page) {
    setPagination((currentPagination) => ({ ...currentPagination, page }));
  }

  return (
    <main className="bg-white">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-slate-700">
          Browse through the doctors specialist.
        </p>

        <form
          onSubmit={applyFilters}
          className="mt-5 grid gap-3 rounded-lg border border-blue-100 bg-[#f8fbff] p-3 md:grid-cols-[1.5fr_repeat(5,1fr)_auto]"
        >
          <input
            name="search"
            value={filters.search}
            onChange={updateFilter}
            placeholder="Search doctor name"
            className="h-10 rounded border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-300"
          />
          <Select
            name="specialty"
            value={filters.specialty}
            onChange={updateFilter}
            placeholder="Specialty"
            options={filterOptions.specialties}
          />
          <Select
            name="location"
            value={filters.location}
            onChange={updateFilter}
            placeholder="Location"
            options={filterOptions.locations}
          />
          <Select
            name="gender"
            value={filters.gender}
            onChange={updateFilter}
            placeholder="Gender"
            options={filterOptions.genders}
          />
          <select
            name="availability"
            value={filters.availability}
            onChange={updateFilter}
            className="h-10 rounded border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-300"
          >
            <option value="">Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <select
            name="sort"
            value={filters.sort}
            onChange={updateFilter}
            className="h-10 rounded border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-300"
          >
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="specialty_asc">Specialty</option>
            <option value="location_asc">Location</option>
            <option value="newest">Newest</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="h-10 rounded bg-brand px-4 text-xs font-semibold text-brand-foreground transition hover:bg-brand-hover"
            >
              Search
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-300"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="mt-5 grid gap-5 lg:grid-cols-[138px_1fr]">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-3 lg:overflow-visible">
              {filterOptions.specialties.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => selectSpecialty(specialty)}
                  className={`h-9 min-w-[132px] rounded border px-3 text-left text-xs font-medium transition ${
                    appliedFilters.specialty === specialty
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </aside>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                {pagination.total} verified active doctor{pagination.total === 1 ? "" : "s"}
              </span>
              <span>
                Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
              </span>
            </div>

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {isLoading ? (
              <p className="rounded-md border border-blue-100 bg-blue-50 px-4 py-6 text-center text-sm text-blue-700">
                Loading doctors...
              </p>
            ) : null}

            {!isLoading && !error && doctors.length === 0 ? (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                No doctors found.
              </p>
            ) : null}

            {!isLoading && !error && doctors.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
                {doctors.map((doctor) => (
                  <article
                    key={doctor.id}
                    className="overflow-hidden rounded-lg border border-blue-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(60,108,201,0.12)]"
                  >
                    <div className="relative flex aspect-[1.02] items-end justify-center bg-[#edf2ff]">
                      <Image
                        src={doctor.imageUrl}
                        alt={doctor.name}
                        fill
                        sizes="(min-width: 1280px) 132px, (min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                        className="object-contain object-bottom px-2 pt-3"
                      />
                    </div>

                    <div className="px-3 py-3">
                      <div
                        className={`flex items-center gap-1.5 text-[10px] font-medium ${
                          doctor.isAvailable ? "text-green-600" : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            doctor.isAvailable ? "bg-green-500" : "bg-slate-400"
                          }`}
                        />
                        {doctor.isAvailable ? "Available" : "Unavailable"}
                      </div>
                      <h2 className="mt-1 text-sm font-semibold leading-5 text-slate-950">
                        {doctor.name}
                      </h2>
                      <p className="mt-0.5 text-[11px] leading-4 text-slate-600">
                        {doctor.specialty}
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        {doctor.location} · {doctor.gender}
                      </p>
                      <Link
                        href={`/appointment/book?doctorId=${doctor.id}`}
                        className="mt-3 inline-flex h-8 w-full items-center justify-center rounded bg-brand text-[11px] font-semibold text-brand-foreground transition hover:bg-brand-hover"
                      >
                        Book
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => goToPage(Math.max(pagination.page - 1, 1))}
                disabled={pagination.page <= 1 || isLoading}
                className="h-9 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  goToPage(Math.min(pagination.page + 1, pagination.totalPages || 1))
                }
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="h-9 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Select({ name, value, onChange, placeholder, options }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="h-10 rounded border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-300"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
