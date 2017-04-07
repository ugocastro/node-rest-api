db.dropDatabase();

db.roles.insert({ _id: ObjectId('58e5131e634a8d13f059930a'), name: 'Admin', __v: 0 });
db.roles.insert({ _id: ObjectId('58e5131e634a8d13f059930b'), name: 'Standard', __v: 0 });

db.users.insert({ _id: ObjectId('58e5131e634a8d13f059930c'), username: 'admin',
  password: '$2a$10$Syj8AUP1Gts8rjWW.A4wLujZ54Wnag7SoF09hqEOmkuRSUdk9P4vC',
  roles:[ObjectId('58e5131e634a8d13f059930a')], __v: 0 });

db.protectionareas.insert({ _id: ObjectId('58e5131e634a8d13f059930d'), name: 'Gotham',
  location: { type: 'Point', coordinates: [-74, 40.74] }, radius: 5, __v: 0 });
db.protectionareas.insert({ _id: ObjectId('58e5131e634a8d13f059930e'), name: 'New York',
  location: { type: 'Point', coordinates: [-23, 21.70] }, radius: 10, __v: 0 });
