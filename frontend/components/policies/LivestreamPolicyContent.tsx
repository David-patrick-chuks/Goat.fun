"use client";

import { Video, Users, Shield, AlertTriangle, Mic, Eye } from "lucide-react";

export default function LivestreamPolicyContent() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Livestream Policy</h1>
      <div className="bg-black border border-white/10 rounded-lg p-8">
        <div className="space-y-8">
          {/* Introduction */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#ffea00] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">GoatFun Livestream Guidelines</h2>
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              Our livestreaming platform enables traders to share market analysis, discuss strategies, and build communities. 
              These guidelines ensure a positive experience for all users.
            </p>
          </div>

          {/* Content Guidelines */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Content Guidelines</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mic className="w-5 h-5 text-green-400" />
                  <h4 className="text-lg font-semibold text-white">Allowed Content</h4>
                </div>
                <ul className="space-y-2 text-white/70">
                  <li>• Market analysis and trading strategies</li>
                  <li>• Educational content about meme tokens</li>
                  <li>• Technical analysis and chart discussions</li>
                  <li>• Community discussions and Q&A sessions</li>
                  <li>• Portfolio reviews and performance updates</li>
                  <li>• News and market updates</li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h4 className="text-lg font-semibold text-white">Prohibited Content</h4>
                </div>
                <ul className="space-y-2 text-white/70">
                  <li>• Explicit or adult content</li>
                  <li>• Hate speech or harassment</li>
                  <li>• Misleading financial advice</li>
                  <li>• Spam or promotional content</li>
                  <li>• Copyrighted material without permission</li>
                  <li>• Illegal activities or content</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Streamer Responsibilities */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-[#ffea00]" />
              <h3 className="text-xl font-semibold text-white">Streamer Responsibilities</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Content Standards</h4>
                <ul className="space-y-2 text-white/70">
                  <li>• Provide accurate and educational content</li>
                  <li>• Clearly label opinions vs. facts</li>
                  <li>• Disclose any financial interests</li>
                  <li>• Maintain professional conduct</li>
                  <li>• Respect community guidelines</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Technical Requirements</h4>
                <ul className="space-y-2 text-white/70">
                  <li>• Stable internet connection</li>
                  <li>• Clear audio and video quality</li>
                  <li>• Appropriate stream titles and descriptions</li>
                  <li>• Regular streaming schedule</li>
                  <li>• Responsive to viewer interactions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Viewer Guidelines */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-[#ffea00]" />
              <h3 className="text-xl font-semibold text-white">Viewer Guidelines</h3>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Chat Etiquette</h4>
                  <ul className="space-y-2 text-white/70">
                    <li>• Be respectful to streamers and other viewers</li>
                    <li>• Ask relevant questions about trading</li>
                    <li>• Avoid spam or repetitive messages</li>
                    <li>• Follow streamer's chat rules</li>
                    <li>• Report inappropriate behavior</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Learning Guidelines</h4>
                  <ul className="space-y-2 text-white/70">
                    <li>• Do your own research before trading</li>
                    <li>• Understand that content is educational</li>
                    <li>• Never invest more than you can afford to lose</li>
                    <li>• Consider multiple sources of information</li>
                    <li>• Ask questions to clarify information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Moderation and Enforcement */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#ffea00]" />
              <h3 className="text-xl font-semibold text-white">Moderation and Enforcement</h3>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Warning System</h4>
                  <p className="text-white/70">
                    First-time violations result in warnings. Repeat violations may lead to temporary or permanent restrictions.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Reporting</h4>
                  <p className="text-white/70">
                    Users can report inappropriate content or behavior. All reports are reviewed by our moderation team.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Appeals Process</h4>
                  <p className="text-white/70">
                    Users can appeal moderation decisions through our support system. Appeals are reviewed within 48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety and Security */}
          <div className="bg-[#ffea00]/10 border border-[#ffea00]/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Safety and Security</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Privacy Protection</h4>
                <ul className="space-y-2 text-white/70">
                  <li>• Never share personal information</li>
                  <li>• Be cautious with wallet addresses</li>
                  <li>• Use strong passwords and 2FA</li>
                  <li>• Report suspicious activity</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Financial Safety</h4>
                <ul className="space-y-2 text-white/70">
                  <li>• Never share private keys</li>
                  <li>• Verify all transactions carefully</li>
                  <li>• Be wary of investment schemes</li>
                  <li>• Report financial scams</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-black/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
            <p className="text-white/70 mb-4">
              If you have questions about our livestream policy or need to report violations, contact us:
            </p>
            <div className="space-y-2 text-white/70">
              <p>Email: support@goatfun.com</p>
              <p>Subject: "Livestream Policy Inquiry"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
