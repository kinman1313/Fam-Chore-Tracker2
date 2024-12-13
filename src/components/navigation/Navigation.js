import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav className="bg-indigo-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-white font-bold text-xl">
                            FamChores
                        </Link>
                    </div>
                    <div className="flex">
                        <Link
                            to="/login"
                            className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation; 