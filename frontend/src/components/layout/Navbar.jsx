import { Link, useLocation } from 'react-router-dom';
import { Shield, Map, Activity, Info, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'Surveillance', path: '/surveillance', icon: Map },
        { name: 'Prediction', path: '/prediction', icon: Activity },
        { name: 'About', path: '/about', icon: Info },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/80 backdrop-blur-md border-b border-dark-500 py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Shield className="w-8 h-8 text-sentinel-500 transition-transform group-hover:scale-110" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sentinel-400 rounded-full animate-pulse" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            BioSentinel
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(link.path)
                                        ? 'text-sentinel-400'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.name}
                            </Link>
                        ))}

                        <Link
                            to="/prediction"
                            className="px-5 py-2 bg-sentinel-600 hover:bg-sentinel-500 text-white text-sm font-semibold rounded-full transition-all hover:shadow-glow-green"
                        >
                            Check Symptoms
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-zinc-400 hover:text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-dark-800 border-b border-dark-600 overflow-hidden"
                    >
                        <div className="px-6 py-4 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-3 py-2 ${isActive(link.path) ? 'text-sentinel-400' : 'text-zinc-400'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                to="/prediction"
                                className="block w-full py-3 text-center bg-sentinel-600 text-white rounded-xl font-semibold mt-4"
                            >
                                Check Symptoms
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export default Navbar;
