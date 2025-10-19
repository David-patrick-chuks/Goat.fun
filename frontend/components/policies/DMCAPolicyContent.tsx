"use client";

import { Shield, AlertTriangle, FileText, Mail } from "lucide-react";

export default function DMCAPolicyContent() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">DMCA Policy</h1>
      <div className="bg-black border border-white/10 rounded-lg p-8">
        <div className="space-y-8">
          {/* Introduction */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#ffea00] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Digital Millennium Copyright Act Policy</h2>
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              GoatFun respects intellectual property rights and is committed to responding to valid DMCA takedown notices. 
              This policy outlines our procedures for handling copyright infringement claims.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8">
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-[#ffea00]" />
                <h3 className="text-xl font-semibold text-white">Filing a DMCA Notice</h3>
              </div>
              <p className="text-white/70 mb-4">
                If you believe your copyrighted work has been used without permission on GoatFun, you may submit a DMCA takedown notice. 
                Your notice must include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
                <li>Your contact information (name, address, phone number, email)</li>
                <li>Identification of the copyrighted work claimed to be infringed</li>
                <li>Identification of the material that is claimed to be infringing</li>
                <li>A statement that you have a good faith belief that the use is not authorized</li>
                <li>A statement that the information is accurate and you are authorized to act</li>
                <li>Your physical or electronic signature</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#ffea00]" />
                <h3 className="text-xl font-semibold text-white">Counter-Notification</h3>
              </div>
              <p className="text-white/70 mb-4">
                If you believe your content was removed in error, you may file a counter-notification. This must include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
                <li>Your contact information</li>
                <li>Identification of the material that was removed</li>
                <li>A statement under penalty of perjury that you have good faith belief the material was removed by mistake</li>
                <li>Consent to jurisdiction of federal court</li>
                <li>Your physical or electronic signature</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-[#ffea00]" />
                <h3 className="text-xl font-semibold text-white">Contact Information</h3>
              </div>
              <p className="text-white/70 mb-4">
                DMCA notices and counter-notifications should be sent to:
              </p>
              <div className="bg-black/50 rounded-lg p-4">
                <p className="text-white font-mono">Email: dmca@goatfun.com</p>
                <p className="text-white/70 text-sm mt-2">
                  Please include DMCA Notice or DMCA Counter-Notification in the subject line.
                </p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-xl font-semibold text-white">Important Notice</h3>
              </div>
              <div className="space-y-3 text-white/70">
                <p>
                  <strong className="text-white">False Claims:</strong> Knowingly making false claims of copyright infringement 
                  may result in liability for damages, including costs and attorney fees.
                </p>
                <p>
                  <strong className="text-white">Repeat Infringers:</strong> We may terminate accounts of users who are 
                  repeat copyright infringers.
                </p>
                <p>
                  <strong className="text-white">Response Time:</strong> We will respond to valid DMCA notices within 
                  24-48 hours of receipt.
                </p>
              </div>
            </div>

            <div className="bg-[#ffea00]/10 border border-[#ffea00]/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">User Responsibilities</h3>
              <div className="space-y-3 text-white/70">
                <p>• Only upload content you own or have permission to use</p>
                <p>• Respect intellectual property rights of others</p>
                <p>• Report copyright infringement when you encounter it</p>
                <p>• Understand that violating copyrights may result in account termination</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
