import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export const useWeather = () => {
    const [loading, setLoading] = useState(false);

    const fetchWeather = async (callback) => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        toast.info("Locating you...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    // Fetch weather from Open-Meteo (Free, No Key)
                    const response = await axios.get(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`
                    );

                    const current = response.data.current;

                    // Map to our form format
                    const weatherData = {
                        temperature: current.temperature_2m, // Celsius
                        humidity: current.relative_humidity_2m, // Percent
                        rainfall: current.precipitation * 24 * 3, // Convert hourly rate to estimated "recent" rainfall (rough heuristic for ML)
                        region_name: `My Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
                    };

                    toast.success("Weather data fetched successfully!");
                    callback(weatherData); // Update form

                } catch (error) {
                    console.error(error);
                    toast.error("Failed to fetch weather data");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error(error);
                toast.error("Location access denied. Please enable GPS.");
                setLoading(false);
            }
        );
    };

    return { fetchWeather, loading };
};
