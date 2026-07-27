
const FindHospital = () => {
    return (
        <div>
             <div className="max-w-7xl mx-auto px-4 py-6">

                    {/* Search */}
                    <section className="bg-slate-900 rounded-2xl p-5 shadow-lg">
                        <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl p-5">

                                        {/* Top Row */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                                            {/* Category */}
                                            <div className="lg:col-span-2">
                                            <select className="w-full h-12 rounded-xl border border-slate-600 bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                                                <option>Doctor</option>
                                                <option>Hospital</option>
                                                <option>Diagnostic Center</option>
                                            </select>
                                            </div>

                                            {/* Search */}
                                            <div className="lg:col-span-8 relative">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>

                                            <input
                                                type="text"
                                                placeholder="Search doctors, hospitals, specialties..."
                                                className="w-full h-12 rounded-xl bg-white pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            </div>

                                            {/* Search Button */}
                                            <div className="lg:col-span-2">
                                            <button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">
                                                Search
                                            </button>
                                            </div>

                                        </div>

                                        {/* Filters */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-5">

                                            <select className="h-11 rounded-xl border border-slate-500 bg-slate-800 text-white px-4 text-sm outline-none hover:border-blue-400">
                                            <option>Gender</option>
                                            </select>

                                            <select className="h-11 rounded-xl border border-slate-500 bg-slate-800 text-white px-4 text-sm outline-none hover:border-blue-400">
                                            <option>Specialties</option>
                                            </select>

                                            <select className="h-11 rounded-xl border border-slate-500 bg-slate-800 text-white px-4 text-sm outline-none hover:border-blue-400">
                                            <option>Country</option>
                                            </select>

                                            <select className="h-11 rounded-xl border border-slate-500 bg-slate-800 text-white px-4 text-sm outline-none hover:border-blue-400">
                                            <option>City</option>
                                            </select>

                                            <select className="h-11 rounded-xl border border-slate-500 bg-slate-800 text-white px-4 text-sm outline-none hover:border-blue-400">
                                            <option>Distance</option>
                                            </select>

                                            <select className="h-11 rounded-xl border border-slate-500 bg-slate-800 text-white px-4 text-sm outline-none hover:border-blue-400">
                                            <option>Consultation Type</option>
                                            </select>

                                        </div>

                                        </div>
                    </section>


                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

                        {/* Doctors */}
                        <div className="lg:col-span-8 space-y-6">

                        <section className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6 ">
                        {/* Doctor Card */}
                        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">

                            {/* Video Call Badge */}
                            <div className="absolute right-5 top-5">
                            <span className="bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-medium">
                                📹 Video Consultation
                            </span>
                            </div>

                            <div className="p-6">

                            <div className="flex gap-5">

                                {/* Doctor Image */}
                                <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm shrink-0">
                                Doctor Image
                                </div>

                                {/* Doctor Details */}
                                <div className="flex-1">

                                <h2 className="text-2xl font-bold text-slate-800">
                                    Dr. Md. Masum Uddin
                                </h2>

                                <p className="mt-1 text-gray-600">
                                    MBBS, FCPS (Medicine), Rheumatology
                                </p>

                                <p className="mt-3 text-sm text-gray-700 leading-6">
                                    Physical Medicine Specialist, Rheumatologist,
                                    Pain Management Specialist
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">

                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                                    Arthritis
                                    </span>

                                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs">
                                    Knee Pain
                                    </span>

                                    <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs">
                                    Osteoarthritis
                                    </span>

                                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs">
                                    Gout
                                    </span>

                                </div>

                                </div>

                            </div>

                            {/* Information */}
                            <div className="grid md:grid-cols-2 gap-5 mt-8">

                                <div className="bg-gray-50 rounded-xl p-4">

                                <h4 className="font-semibold">
                                    Hospital
                                </h4>

                                <p className="mt-2 text-gray-600">
                                    Ibn Sina Diagnostic Center
                                </p>

                                <p className="text-sm text-gray-500">
                                    House #490, DIT Road, Malibagh
                                </p>

                                </div>

                                <div className="bg-green-50 rounded-xl p-4 border border-green-100">

                                <h4 className="font-semibold text-green-700">
                                    Availability
                                </h4>

                                <p className="mt-2 text-gray-700">
                                    Sunday - Tuesday
                                </p>

                                <p className="text-green-700 font-semibold">
                                    04:00 PM - 06:30 PM
                                </p>

                                </div>

                            </div>

                            {/* Footer */}
                            <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-4 border-t pt-5">

                                <input
                                type="date"
                                className="w-full lg:w-64 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />

                                <button className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition">
                                Book Appointment
                                </button>

                            </div>

                            </div>

                        </div>
                        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">

                            {/* Video Call Badge */}
                            <div className="absolute right-5 top-5">
                            <span className="bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-medium">
                                📹 Video Consultation
                            </span>
                            </div>

                            <div className="p-6">

                            <div className="flex gap-5">

                                {/* Doctor Image */}
                                <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm shrink-0">
                                Doctor Image
                                </div>

                                {/* Doctor Details */}
                                <div className="flex-1">

                                <h2 className="text-2xl font-bold text-slate-800">
                                    Dr. Md. Masum Uddin
                                </h2>

                                <p className="mt-1 text-gray-600">
                                    MBBS, FCPS (Medicine), Rheumatology
                                </p>

                                <p className="mt-3 text-sm text-gray-700 leading-6">
                                    Physical Medicine Specialist, Rheumatologist,
                                    Pain Management Specialist
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">

                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                                    Arthritis
                                    </span>

                                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs">
                                    Knee Pain
                                    </span>

                                    <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs">
                                    Osteoarthritis
                                    </span>

                                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs">
                                    Gout
                                    </span>

                                </div>

                                </div>

                            </div>

                            {/* Information */}
                            <div className="grid md:grid-cols-2 gap-5 mt-8">

                                <div className="bg-gray-50 rounded-xl p-4">

                                <h4 className="font-semibold">
                                    Hospital
                                </h4>

                                <p className="mt-2 text-gray-600">
                                    Ibn Sina Diagnostic Center
                                </p>

                                <p className="text-sm text-gray-500">
                                    House #490, DIT Road, Malibagh
                                </p>

                                </div>

                                <div className="bg-green-50 rounded-xl p-4 border border-green-100">

                                <h4 className="font-semibold text-green-700">
                                    Availability
                                </h4>

                                <p className="mt-2 text-gray-700">
                                    Sunday - Tuesday
                                </p>

                                <p className="text-green-700 font-semibold">
                                    04:00 PM - 06:30 PM
                                </p>

                                </div>

                            </div>

                            {/* Footer */}
                            <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-4 border-t pt-5">

                                <input
                                type="date"
                                className="w-full lg:w-64 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />

                                <button className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition">
                                Book Appointment
                                </button>

                            </div>

                            </div>

                        </div>
                        
                        </section>
                        </div>

                        {/* Advertisement */}
                        <aside className="lg:col-span-4">

                        <div className="sticky top-5 space-y-6">

                            <div className="h-64 rounded-2xl bg-sky-50 border-2 border-dashed border-sky-200 flex items-center justify-center text-sky-400">
                            Advertisement
                            </div>

                            <div className="h-[420px] rounded-2xl bg-sky-50 border-2 border-dashed border-sky-200 flex items-center justify-center text-sky-400">
                            Advertisement
                            </div>

                        </div>

                        </aside>

                    </div>
                </div>
        </div>
    );
};

export default FindHospital;