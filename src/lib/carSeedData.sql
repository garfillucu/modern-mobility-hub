
-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert 10 sample cars
INSERT INTO cars (name, brand, year, pricePerDay, imageUrl, transmission, capacity, category, description, features)
VALUES
  (
    'Honda Jazz', 
    'Honda', 
    2023, 
    350000, 
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8aG9uZGElMjBqYXp6fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60', 
    'Automatic', 
    5, 
    'Hatchback', 
    'Hatchback praktis dengan konsumsi BBM efisien dan kabin luas. Cocok untuk perkotaan.', 
    ARRAY['Eco Mode', 'Touchscreen Display', 'Backup Camera', 'Bluetooth', 'USB Port']
  ),
  (
    'Mitsubishi Xpander', 
    'Mitsubishi', 
    2022, 
    450000, 
    'https://images.unsplash.com/photo-1631220706319-ded7a34a2424?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bWl0c3ViaXNoaSUyMHhwYW5kZXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', 
    'Automatic', 
    7, 
    'MPV', 
    'MPV serbaguna dengan interior lega dan nyaman untuk keluarga. Ground clearance tinggi untuk berbagai kondisi jalan.', 
    ARRAY['Keyless Entry', 'Start/Stop Button', 'Cruise Control', 'Rear AC Vents', 'Foldable Seats']
  ),
  (
    'Suzuki Ertiga', 
    'Suzuki', 
    2023, 
    400000, 
    'https://images.unsplash.com/photo-1631712134670-c4652703a453?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8c3V6dWtpJTIwZXJ0aWdhfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60', 
    'Manual', 
    7, 
    'MPV', 
    'MPV kompak dengan harga terjangkau dan konsumsi BBM irit. Cocok untuk keluarga kecil.', 
    ARRAY['Dual Airbags', 'ABS', 'Power Steering', 'Adjustable Seats', 'Power Windows']
  ),
  (
    'Toyota Alphard', 
    'Toyota', 
    2023, 
    1500000, 
    'https://images.unsplash.com/photo-1621707168349-2216255ff780?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dG95b3RhJTIwYWxwaGFyZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60', 
    'Automatic', 
    7, 
    'MPV Premium', 
    'MPV mewah dengan fitur premium dan interior luas. Kenyamanan setara limousine.', 
    ARRAY['Captain Seats', 'Power Door', 'Premium Sound System', 'Adaptive Cruise Control', 'Leather Interior', 'Ambient Lighting']
  ),
  (
    'Toyota Innova', 
    'Toyota', 
    2022, 
    500000, 
    'https://images.unsplash.com/photo-1583267746897-2cf415887172?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dG95b3RhJTIwaW5ub3ZhfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60', 
    'Automatic', 
    7, 
    'MPV', 
    'MPV tangguh dan nyaman untuk perjalanan jauh. Mesin diesel bertenaga dan handal.', 
    ARRAY['Diesel Engine', 'Rear AC', 'Touchscreen Entertainment', 'Traction Control', 'Hill Start Assist']
  ),
  (
    'Honda CR-V', 
    'Honda', 
    2023, 
    700000, 
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aG9uZGElMjBjcnZ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', 
    'Automatic', 
    5, 
    'SUV', 
    'SUV dengan handling responsif dan kabın luas. Cocok untuk keluarga urban.', 
    ARRAY['Honda Sensing', 'Lane Keep Assist', 'Adaptive Cruise Control', 'Collision Mitigation', 'Apple CarPlay', 'Android Auto']
  ),
  (
    'BMW 320i', 
    'BMW', 
    2023, 
    1200000, 
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGJtdyUyMDMyMGl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', 
    'Automatic', 
    5, 
    'Sedan Premium', 
    'Sedan premium dengan performa dan handling terbaik di kelasnya. Ultimate driving machine.', 
    ARRAY['Sport Mode', 'Leather Seats', 'BMW iDrive', 'Premium Sound System', 'Ambient Lighting', 'Driver Assist']
  ),
  (
    'Daihatsu Rocky', 
    'Daihatsu', 
    2023, 
    350000, 
    'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8ZGFpaGF0c3UlMjByb2NreXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60', 
    'Automatic', 
    5, 
    'SUV Compact', 
    'SUV kompak dengan teknologi canggih dan irit bahan bakar. Cocok untuk perkotaan.', 
    ARRAY['360 Camera', 'Blind Spot Monitor', 'DNGA Platform', 'Turbocharged Engine', 'Smart Key']
  ),
  (
    'Toyota Camry', 
    'Toyota', 
    2022, 
    800000, 
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8dG95b3RhJTIwY2Ftcnl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', 
    'Automatic', 
    5, 
    'Sedan', 
    'Sedan mewah dengan kabin senyap dan kualitas berkendara superior. Pilihan eksekutif.', 
    ARRAY['Leather Interior', 'JBL Audio', 'Wireless Charging', 'Dynamic Radar Cruise Control', 'Head-up Display']
  ),
  (
    'Mercedes-Benz C-Class', 
    'Mercedes-Benz', 
    2023, 
    1500000, 
    'https://images.unsplash.com/photo-1563720223185-11069f619acf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWVyY2VkZXMlMjBjJTIwY2xhc3N8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', 
    'Automatic', 
    5, 
    'Sedan Premium', 
    'Sedan premium Jerman dengan teknologi canggih dan kenyamanan terbaik. Simbol kesuksesan.', 
    ARRAY['MBUX Infotainment', 'Burmester Sound', 'Ambient Lighting', 'Drive Pilot', 'Wireless Charging', 'Memory Seats']
  );
