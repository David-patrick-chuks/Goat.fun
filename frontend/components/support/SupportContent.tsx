"use client";

export default function SupportContent() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Support Center</h1>
      <div className="bg-black border border-white/10 rounded-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#ffea00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Need Help?</h2>
          <p className="text-white/70 mb-6">Our support team is here to assist you with any questions</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#ffea00] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#ffea00] transition-colors">
              Contact Support
            </button>
            <button className="bg-white/10 text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors">
              View FAQs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
