const mongoose = require('mongoose');
const { Market } = require('./dist/models/Market.js');
const dotenv = require('dotenv');
dotenv.config();

async function createSampleMarkets() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://goatfun:Dave%23dave5686@cluster0.z4pn6ak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    
    // Clear existing markets
    await Market.deleteMany({});
    
    // Create sample markets
    const sampleMarkets = [
      {
        creator: '0x1234567890123456789012345678901234567890',
        title: 'Will Bitcoin reach $100k this year?',
        ticker: 'BTC100K',
        description: 'Predicting if Bitcoin will hit $100,000 by end of 2024',
        banner: '/goatfun.png',
        duration: 24,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        bullishSupply: 1000,
        fadeSupply: 500,
        bullishPrice: 1.2,
        fadePrice: 0.8,
        poolBalance: 1500,
        status: 'active'
      },
      {
        creator: '0x0987654321098765432109876543210987654321',
        title: 'Tesla stock will go up 50%',
        ticker: 'TSLA50',
        description: 'Tesla stock prediction for next quarter',
        banner: '/goatfun.png',
        duration: 48,
        startTime: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        bullishSupply: 2000,
        fadeSupply: 800,
        bullishPrice: 1.5,
        fadePrice: 0.7,
        poolBalance: 2800,
        status: 'active'
      },
      {
        creator: '0x1111111111111111111111111111111111111111',
        title: 'Ethereum will outperform Bitcoin',
        ticker: 'ETHWIN',
        description: 'ETH vs BTC performance prediction',
        banner: '/goatfun.png',
        duration: 72,
        startTime: new Date(),
        endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
        bullishSupply: 1500,
        fadeSupply: 1200,
        bullishPrice: 1.3,
        fadePrice: 0.9,
        poolBalance: 2700,
        status: 'active',
        livestream: { isLive: true }
      }
    ];
    
    await Market.insertMany(sampleMarkets);
    console.log('Sample markets created successfully!');
    
    const count = await Market.countDocuments();
    console.log('Total markets in database:', count);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSampleMarkets();
