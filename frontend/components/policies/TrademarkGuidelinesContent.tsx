"use client";

import { Shield, AlertTriangle, FileText, Users, Eye } from "lucide-react";

export default function TrademarkGuidelinesContent() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Trademark Guidelines</h1>
      <div className="bg-black border border-white/10 rounded-lg p-8">
        <div className="space-y-8">
          {/* Introduction */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#ffea00] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">GoatFun Trademark Guidelines</h2>
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              These guidelines explain how you may use GoatFun trademarks, logos, and other brand assets. 
              We want to protect our brand while allowing appropriate use by our community.
            </p>
          </div>

          {/* Trademark Usage */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Trademark Usage Guidelines</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-green-400" />
                  <h4 className="text-lg font-semibold text-white">Permitted Uses</h4>
                </div>
                <ul className="space-y-2 text-white/70">
                  <li>• Referencing GoatFun in news articles or reviews</li>
                  <li>• Educational content about our platform</li>
                  <li>• Community discussions and analysis</li>
                  <li>• Social media posts mentioning GoatFun</li>
                  <li>• Academic research and studies</li>
                  <li>• Fair use commentary and criticism</li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h4 className="text-lg font-semibold text-white">Prohibited Uses</h4>
                </div>
                <ul className="space-y-2 text-white/70">
                  <li>• Creating competing platforms or services</li>
                  <li>• Impersonating GoatFun or its employees</li>
                  <li>• Using logos without permission</li>
                  <li>• Suggesting official endorsement</li>
                  <li>• Domain names containing "goatfun"</li>
                  <li>• Merchandise or commercial products</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Brand Assets */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-[#ffea00]" />
              <h3 className="text-xl font-semibold text-white">Brand Assets</h3>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Trademarked Elements</h4>
                  <ul className="space-y-2 text-white/70">
                    <li>• "GoatFun" wordmark and logo</li>
                    <li>• Goat head icon and mascot</li>
                    <li>• Platform interface designs</li>
                    <li>• Slogans and taglines</li>
                    <li>• Color schemes and branding</li>
                    <li>• Product names and features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Usage Requirements</h4>
                  <ul className="space-y-2 text-white/70">
                    <li>• Maintain proper spacing and proportions</li>
                    <li>• Use official brand colors</li>
                    <li>• Include trademark symbols (™/®)</li>
                    <li>• Don't modify or alter designs</li>
                    <li>• Credit GoatFun appropriately</li>
                    <li>• Follow brand guidelines</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-[#ffea00]" />
              <h3 className="text-xl font-semibold text-white">Community Guidelines</h3>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Content Creation</h4>
                  <ul className="space-y-2 text-white/70">
                    <li>• Create original content about GoatFun</li>
                    <li>• Share honest reviews and experiences</li>
                    <li>• Educate others about the platform</li>
                    <li>• Build community around trading</li>
                    <li>• Respect intellectual property</li>
                    <li>• Follow platform terms of service</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Social Media</h4>
                  <ul className="space-y-2 text-white/70">
                    <li>• Use official hashtags appropriately</li>
                    <li>• Tag @GoatFun in relevant posts</li>
                    <li>• Share trading insights and analysis</li>
                    <li>• Engage positively with community</li>
                    <li>• Report trademark violations</li>
                    <li>• Maintain professional conduct</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Enforcement Policy */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#ffea00]" />
              <h3 className="text-xl font-semibold text-white">Enforcement Policy</h3>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Monitoring</h4>
                  <p className="text-white/70">
                    We actively monitor trademark usage across platforms and take action against violations.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Response Process</h4>
                  <p className="text-white/70">
                    Violations are addressed through cease and desist notices, legal action, or platform takedowns.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Appeals</h4>
                  <p className="text-white/70">
                    Users can appeal enforcement actions through our legal team. Appeals are reviewed within 30 days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fair Use Guidelines */}
          <div className="bg-[#ffea00]/10 border border-[#ffea00]/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Fair Use Guidelines</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Educational Use</h4>
                  <ul className="space-y-2 text-white/70">
                    <li>• Teaching about DeFi and trading</li>
                    <li>• Academic research and papers</li>
                    <li>• News reporting and journalism</li>
                    <li>• Comparative analysis</li>
                    <li>• Historical documentation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Commercial Use</h4>
                  <ul className="space-y-2 text-white/70">
                    <li>• Requires written permission</li>
                    <li>• Must not compete with GoatFun</li>
                    <li>• Should benefit the community</li>
                    <li>• Must follow brand guidelines</li>
                    <li>• Subject to approval process</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-black/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Trademark Inquiries</h3>
            <p className="text-white/70 mb-4">
              For trademark usage permissions, licensing inquiries, or to report violations:
            </p>
            <div className="space-y-2 text-white/70">
              <p>Email: legal@goatfun.com</p>
              <p>Subject: "Trademark Inquiry"</p>
              <p>Include: Intended use, duration, and scope of usage</p>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-semibold text-white">Legal Notice</h3>
            </div>
            <div className="space-y-3 text-white/70">
              <p>
                <strong className="text-white">Disclaimer:</strong> These guidelines are for informational purposes only 
                and do not constitute legal advice. Consult with legal counsel for specific trademark questions.
              </p>
              <p>
                <strong className="text-white">Updates:</strong> These guidelines may be updated periodically. 
                Continued use of GoatFun trademarks constitutes acceptance of current terms.
              </p>
              <p>
                <strong className="text-white">Jurisdiction:</strong> Trademark disputes are subject to applicable 
                laws and jurisdiction where GoatFun operates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
