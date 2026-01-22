import { motion } from 'framer-motion';
import { Database, Brain, Globe, Shield, Code, Server } from 'lucide-react';

function About() {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 gradient-text">Methodology & Architecture</h1>

                <div className="space-y-12">
                    {/* Section 1: Introduction */}
                    <section>
                        <p className="text-xl text-zinc-300 leading-relaxed mb-6">
                            BioSentinel represents a paradigm shift from passive data collection to active,
                            event-driven surveillance. By combining hard environmental data with soft social signals,
                            we interpret the "pulse" of a region to predict disease outbreaks before they escalate.
                        </p>
                    </section>

                    {/* Section 2: The Core Pipeline */}
                    <section className="bg-dark-800 rounded-3xl p-8 border border-dark-600">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Server className="w-6 h-6 text-sentinel-500" />
                            The Loop Function
                        </h2>

                        <div className="relative border-l-2 border-dark-600 pl-8 space-y-8 ml-3">
                            <div className="relative">
                                <span className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-dark-600 border-4 border-dark-800" />
                                <h3 className="text-lg font-semibold text-white mb-2">1. Data Ingestion (Cron/Celery)</h3>
                                <p className="text-zinc-400">
                                    Every hour, autonomous workers fetch real-time weather metrics (temp, humidity, rainfall)
                                    and scrape local news headlines for target cities.
                                </p>
                            </div>

                            <div className="relative">
                                <span className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-sentinel-600 border-4 border-dark-800 shadow-glow-green" />
                                <h3 className="text-lg font-semibold text-white mb-2">2. Dual-Engine Analysis</h3>
                                <ul className="list-disc list-inside text-zinc-400 space-y-2">
                                    <li>
                                        <strong className="text-white">RandomForest Classifier:</strong> Predicts vector suitability based on weather
                                        (e.g., 28°C + 85% humidity = High Dengue Risk).
                                    </li>
                                    <li>
                                        <strong className="text-white">NLP Sentiment Engine:</strong> Scans headlines for trigger words
                                        ("outbreak", "hospital surge") to detect social proof of disease.
                                    </li>
                                </ul>
                            </div>

                            <div className="relative">
                                <span className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-dark-600 border-4 border-dark-800" />
                                <h3 className="text-lg font-semibold text-white mb-2">3. Risk Aggregation</h3>
                                <p className="text-zinc-400">
                                    Scores are weighted (70% Weather / 30% News) to generate a final
                                    <span className="text-white font-mono mx-1">RiskSnapshot</span>,
                                    stored in PostgreSQL.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Tech Stack */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Built With</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { name: 'FastAPI', icon: Code, color: 'text-teal-400' },
                                { name: 'Celery + Redis', icon: Database, color: 'text-orange-400' },
                                { name: 'Scikit-Learn', icon: Brain, color: 'text-blue-400' },
                                { name: 'React + Vite', icon: Globe, color: 'text-purple-400' }
                            ].map((tech, i) => (
                                <div key={i} className="p-4 bg-dark-800 rounded-xl border border-dark-600 flex items-center gap-3">
                                    <tech.icon className={`w-5 h-5 ${tech.color}`} />
                                    <span className="font-medium text-zinc-300">{tech.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default About;
