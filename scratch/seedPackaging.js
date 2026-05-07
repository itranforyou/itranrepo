import { addPackagingOption } from './lib/packaging';

const seedPackaging = async () => {
  const options = [
    { name: 'Luxury Box', price: 99, image: 'https://images.unsplash.com/photo-1549465220-1d8c9d9c4709?auto=format&fit=crop&q=80&w=400', enabled: true },
    { name: 'Wooden Box', price: 249, image: 'https://images.unsplash.com/photo-1512418490979-92798ccc1380?auto=format&fit=crop&q=80&w=400', enabled: true },
    { name: 'Velvet Packaging', price: 149, image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=400', enabled: true }
  ];

  for (const opt of options) {
    await addPackagingOption(opt);
    console.log(`Added ${opt.name}`);
  }
};

// This is just a reference, it won't run directly without node/firebase setup
// seedPackaging();
