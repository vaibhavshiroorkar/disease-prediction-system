import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity, Map, ArrowRight, Zap, Globe, Database } from 'lucide-react';

function Home() {
    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center p-6">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sentinel-500/20 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
                </div>

                <div className="container mx-auto relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700/50 border border-dark-500 backdrop-blur-md mb-6">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sentinel-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-sentinel-500"></span>
                            </span>
                            <span className="text-sm font-medium text-zinc-300">System Online: Monitoring 6 Major Regions</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none">
                            Predict the <br />
                            <span className="gradient-text">Unseen.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            BioSentinel leverages autonomous AI agents to predict disease outbreaks
                            before they happen, protecting communities through real-time surveillance.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/surveillance"
                                className="w-full sm:w-auto px-8 py-4 bg-sentinel-600 hover:bg-sentinel-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-glow-green flex items-center justify-center gap-2 group"
                            >
                                View Live Map
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/prediction"
                                className="w-full sm:w-auto px-8 py-4 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-bold text-lg transition-all border border-dark-500 hover:border-zinc-400 flex items-center justify-center gap-2"
                            >
                                Check Symptoms
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-dark-800/50 border-y border-dark-700">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'Prediction Accuracy', value: '94%', icon: Activity },
                            { label: 'Data Points Analyzed', value: '1.2M+', icon: Database },
                            { label: 'Active Regions', value: '6', icon: MapPin },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-4 p-6 rounded-2xl bg-dark-800 border border-dark-600"
                            >
                                <div className="p-3 bg-dark-700 rounded-xl">
                                    <stat.icon className="w-8 h-8 text-sentinel-400" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                                    <p className="text-zinc-500">{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold mb-4">Autonomous Intelligence</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Our system operates in continuous loops, fusing environmental data with social signals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Globe,
                                title: "Global Surveillance",
                                desc: "Real-time monitoring of weather patterns, humidity, and temperature variations across monitored zones."
                            },
                            {
                                icon: Zap,
                                title: "Event-Driven AI",
                                desc: "Autonomous agents scan news outlets and social signals to detect early warning signs of outbreaks."
                            },
                            {
                                icon: Shield,
                                title: "Context-Aware Triage",
                                desc: "Symptom analysis that adapts based on the regional threat level, providing smarter recommendations."
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="p-8 rounded-3xl bg-dark-800/50 border border-dark-600 hover:border-sentinel-500/30 transition-all hover:bg-dark-700/50 group"
                            >
                                <div className="w-14 h-14 bg-dark-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-7 h-7 text-sentinel-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

// Helper component for the icon
function MapPin({ className }) {
    return <Map className={className} />;
}

export default Home;
