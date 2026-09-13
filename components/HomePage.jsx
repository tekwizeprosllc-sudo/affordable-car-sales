'use client';
import React, { useState } from 'react';
import { ChevronRight, Phone, MessageCircle, Search, Calendar, DollarSign, TrendingUp, Users, Star, Award } from 'lucide-react';

const HomePage = () => {
  const [avaOpen, setAvaOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const featuredVehicles = [
    { id: 1, year: 2023, make: 'Chevrolet', model: 'Malibu', trim: 'LS FLEET', price: 11995, mileage: 97910, stock: '155443', color: 'Blue', image: 'https://images.dealercarsearch.com/DealerImages/20290/45646/23825154-1.jpg', engine: '1.5L L4', trans: 'CVT' },
    { id: 2, year: 2017, make: 'GMC', model: 'Yukon', trim: 'SLT', price: 15995, mileage: 148895, stock: '185887', color: 'White', image: 'https://images.dealercarsearch.com/DealerImages/20290/45646/23978526-1.jpg', engine: '5.3L V8', trans: 'Automatic' },
    { id: 3, year: 2019, make: 'Hyundai', model: 'Tucson', trim: 'SE', price: 9995, mileage: 104211, stock: '010895', color: 'Red', image: 'https://images.dealercarsearch.com/DealerImages/20290/45646/24231547-1.jpg', engine: '2.0L L4', trans: 'Automatic' },
    { id: 4, year: 2012, make: 'Chevrolet', model: 'Silverado 1500', trim: 'LT', price: 13499, mileage: 85061, stock: '207859', color: 'Blue', image: 'https://images.dealercarsearch.com/DealerImages/20290/45646/24172174-1.jpg', engine: '5.3L V8', trans: 'Automatic' },
    { id: 5, year: 2021, make: 'Nissan', model: 'Kicks', trim: 'S', price: 10499, mileage: 84789, stock: '547027', color: 'Black', image: 'https://images.dealercarsearch.com/DealerImages/20290/45646/24207787-1.jpg', engine: '1.6L L4', trans: 'CVT' },
    { id: 6, year: 2011, make: 'Honda', model: 'Civic', trim: 'LX', price: 8495, mileage: 118026, stock: '516441', color: 'Gray', image: 'https://images.dealercarsearch.com/DealerImages/20290/45646/23973450-1.jpg', engine: '1.8L L4', trans: 'Automatic' }
  ];

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold text-white">A</div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm">AFFORDABLE</span>
              <span className="text-red-500 text-xs font-bold">CAR SALES</span>
            </div>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-red-500 transition">INVENTORY</a>
            <a href="#" className="hover:text-red-500 transition">FINANCING</a>
            <a href="#" className="hover:text-red-500 transition">TRADE-IN</a>
            <a href="#" className="hover:text-red-500 transition">ABOUT US</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Phone size={16} />
              <span>(513) 424-0304</span>
              <span className="text-gray-600">Mon - Sat: 9AM - 7PM</span>
            </div>
            <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold text-sm flex items-center gap-2 transition">
              <MessageCircle size={16} />
              TALK WITH AVA
            </button>
          </div>
        </div>
      </header>

      <section className="relative h-screen flex items-center justify-start overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
          <img src="https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=1600&q=80" alt="Hero car" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl z-0"></div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl">
            <div className="text-red-500 text-sm font-bold tracking-wider mb-4">GREAT CARS. REAL PEOPLE. A BETTER WAY FORWARD.</div>
            <h1 className="text-6xl md:text-7xl font-black leading-tight mb-4">
              <span className="text-white">DRIVE MORE.</span><br />
              <span className="text-red-500">WORRY LESS.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-xl">Quality used cars, trucks, and SUVs at honest prices. Flexible financing, fair trade-in values, and test drives that fit your schedule.</p>
            <div className="flex gap-2 mb-8">
              <div className="flex-1 bg-gray-900/80 backdrop-blur border border-gray-700 rounded flex items-center px-4">
                <Search size={18} className="text-gray-500" />
                <input type="text" placeholder="Search makes, models, or keywords..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent py-3 px-3 text-white placeholder-gray-500 outline-none" />
              </div>
              <button className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded font-bold flex items-center gap-2 transition group">
                BROWSE INVENTORY
                <ChevronRight size={18} className="group-hover:translate-x-1 transition" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="text-red-500 mt-1"><Award size={20} /></div>
                <div>
                  <div className="text-2xl font-bold">182</div>
                  <div className="text-sm text-gray-400">Point Inspection</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-red-500 mt-1"><TrendingUp size={20} /></div>
                <div>
                  <div className="text-2xl font-bold">Transparent</div>
                  <div className="text-sm text-gray-400">No Hidden Fees</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-red-500 mt-1"><DollarSign size={20} /></div>
                <div>
                  <div className="text-2xl font-bold">Flexible</div>
                  <div className="text-sm text-gray-400">All Credit Types</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-red-500 mt-1"><Users size={20} /></div>
                <div>
                  <div className="text-2xl font-bold">Trade-Ins</div>
                  <div className="text-sm text-gray-400">Get a Real Offer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-2">500+</div>
            <div className="text-gray-400">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-2">4.8</div>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-red-500 text-red-500" />)}
            </div>
            <div className="text-gray-400">Google Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-2">10+</div>
            <div className="text-gray-400">Years in Business</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-2">100%</div>
            <div className="text-gray-400">Customer Focused</div>
          </div>
        </div>
      </section>

      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black mb-2">BROWSE INVENTORY</h2>
              <p className="text-gray-400">Hand-picked vehicles from our lot</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold flex items-center gap-2 transition">
              VIEW 200+ VEHICLES
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-red-600/50 transition group">
                <div className="relative h-48 bg-gray-800 overflow-hidden">
                  <img src={vehicle.image} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&q=80'; }} />
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">${vehicle.price.toLocaleString()}</div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  <p className="text-sm text-gray-400 mb-4">{vehicle.trim}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-4">
                    <div><span className="text-gray-600">Mileage:</span> {vehicle.mileage.toLocaleString()} mi</div>
                    <div><span className="text-gray-600">Stock:</span> {vehicle.stock}</div>
                    <div><span className="text-gray-600">Engine:</span> {vehicle.engine}</div>
                    <div><span className="text-gray-600">Trans:</span> {vehicle.trans}</div>
                  </div>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold text-sm flex items-center justify-center gap-2 transition">
                    VIEW DETAILS
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-950 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
              <Calendar className="text-red-500 mb-4" size={28} />
              <h3 className="font-bold text-lg mb-2">Schedule Test Drive</h3>
              <p className="text-sm text-gray-400">Book a time that works for you</p>
            </div>
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
              <DollarSign className="text-red-500 mb-4" size={28} />
              <h3 className="font-bold text-lg mb-2">Get Financing</h3>
              <p className="text-sm text-gray-400">Flexible options for every budget</p>
            </div>
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
              <TrendingUp className="text-red-500 mb-4" size={28} />
              <h3 className="font-bold text-lg mb-2">Trade-In Appraisal</h3>
              <p className="text-sm text-gray-400">Get top value for your current vehicle</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black border-t border-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold text-white text-sm">A</div>
                <span className="font-bold">Affordable Car Sales</span>
              </div>
              <p className="text-sm text-gray-400">1290 Elliot Dr, Middletown, OH 45044</p>
              <p className="text-sm text-gray-400">(513) 424-0304</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><a href="#" className="hover:text-red-500 transition">Inventory</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Financing</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Trade-In</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><a href="#" className="hover:text-red-500 transition">About Us</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Contact</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><a href="#" className="hover:text-red-500 transition">Facebook</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Instagram</a></li>
                <li><a href="#" className="hover:text-red-500 transition">Google</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-900 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 Affordable Car Sales. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {avaOpen && (
        <div className="fixed right-4 bottom-4 w-96 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold">A</div>
              <div>
                <div className="font-bold text-sm">Ava</div>
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Online | Here to help
                </div>
              </div>
            </div>
            <button onClick={() => setAvaOpen(false)} className="text-gray-500 hover:text-gray-300">✕</button>
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-black">
            <div className="bg-gray-800 rounded-lg p-3 text-sm">
              <p className="font-bold text-red-500 mb-1">👋 Hi there!</p>
              <p className="text-gray-300">I'm Ava — I can help you find the right vehicle, answer questions, schedule a test drive, and more.</p>
            </div>
            <div className="text-xs text-gray-500 text-center">What would you like to do today?</div>
          </div>
          <div className="border-t border-gray-800 p-4 space-y-2">
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded flex items-center justify-center gap-2 transition">
              <Search size={14} /> Search Inventory
            </button>
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded flex items-center justify-center gap-2 transition">
              <Calendar size={14} /> Schedule Test Drive
            </button>
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded flex items-center justify-center gap-2 transition">
              <DollarSign size={14} /> Financing Questions
            </button>
          </div>
          <div className="border-t border-gray-800 p-3 bg-gray-950">
            <div className="flex gap-2">
              <input type="text" placeholder="Ask Ava anything..." className="flex-1 bg-gray-800 text-white text-sm rounded px-3 py-2 placeholder-gray-600 outline-none focus:ring-1 focus:ring-red-600" />
              <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition">
                <MessageCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!avaOpen && (
        <button onClick={() => setAvaOpen(true)} className="fixed right-4 bottom-4 bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition z-40">
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default HomePage;
