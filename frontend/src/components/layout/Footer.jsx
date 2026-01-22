import { Github, Twitter, Mail } from 'lucide-react';

function Footer() {
    return (
        <footer className="bg-dark-900 border-t border-dark-600 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold text-white mb-4">BioSentinel</h3>
                        <p className="text-zinc-400 leading-relaxed max-w-md">
                            An autonomous epidemiological surveillance system leveraging machine learning
                            and real-time data to predict disease outbreaks and provide context-aware
                            health triage.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Platform</h4>
                        <ul className="space-y-2 text-zinc-400">
                            <li><a href="/surveillance" className="hover:text-sentinel-400 transition-colors">Surveillance Map</a></li>
                            <li><a href="/prediction" className="hover:text-sentinel-400 transition-colors">Symptom Checker</a></li>
                            <li><a href="/about" className="hover:text-sentinel-400 transition-colors">Methodology</a></li>
                            <li><a href="#" className="hover:text-sentinel-400 transition-colors">API Docs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Connect</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-zinc-400 hover:bg-sentinel-600 hover:text-white transition-all">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-zinc-400 hover:bg-blue-500 hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-zinc-400 hover:bg-purple-500 hover:text-white transition-all">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-dark-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-500 text-sm">
                        © {new Date().getFullYear()} BioSentinel. Open source implementation.
                    </p>
                    <div className="flex gap-6 text-sm text-zinc-500">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
