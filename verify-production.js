#!/usr/bin/env node

// Production Readiness Verification Script for Sawari.pk
// Run with: node verify-production.js

import fs from 'fs';
import path from 'path';

console.log('🔍 Sawari.pk Production Readiness Check\n');

const checks = [];

// Backend Checks
console.log('📦 Backend Checks:');

// Check package.json scripts
const backendPkgPath = './backend/package.json';
if (fs.existsSync(backendPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(backendPkgPath));
    checks.push({
        name: '✅ Backend package.json exists',
        status: true
    });
    
    if (pkg.scripts && pkg.scripts.start && pkg.scripts.dev) {
        checks.push({
            name: '✅ Production scripts configured',
            status: true
        });
    } else {
        checks.push({
            name: '❌ Missing production scripts',
            status: false
        });
    }
} else {
    checks.push({
        name: '❌ Backend package.json missing',
        status: false
    });
}

// Check environment template
if (fs.existsSync('./backend/.env.production.example')) {
    checks.push({
        name: '✅ Production environment template exists',
        status: true
    });
} else {
    checks.push({
        name: '❌ Production environment template missing',
        status: false
    });
}

// Frontend Checks
console.log('\n🌐 Frontend Checks:');

const frontendPkgPath = './frontend/package.json';
if (fs.existsSync(frontendPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(frontendPkgPath));
    checks.push({
        name: '✅ Frontend package.json exists',
        status: true
    });
    
    if (pkg.scripts && pkg.scripts.build && pkg.scripts.preview) {
        checks.push({
            name: '✅ Build scripts configured',
            status: true
        });
    } else {
        checks.push({
            name: '❌ Missing build scripts',
            status: false
        });
    }
} else {
    checks.push({
        name: '❌ Frontend package.json missing',
        status: false
    });
}

// Check frontend environment template
if (fs.existsSync('./frontend/.env.production.example')) {
    checks.push({
        name: '✅ Frontend environment template exists',
        status: true
    });
} else {
    checks.push({
        name: '❌ Frontend environment template missing',
        status: false
    });
}

// Documentation Checks
console.log('\n📚 Documentation Checks:');

if (fs.existsSync('./DEPLOYMENT_CHECKLIST.md')) {
    checks.push({
        name: '✅ Deployment checklist exists',
        status: true
    });
} else {
    checks.push({
        name: '❌ Deployment checklist missing',
        status: false
    });
}

if (fs.existsSync('./readme.md')) {
    const readme = fs.readFileSync('./readme.md', 'utf8');
    if (readme.includes('Production Deployment Guide')) {
        checks.push({
            name: '✅ Production documentation updated',
            status: true
        });
    } else {
        checks.push({
            name: '❌ Production documentation needs update',
            status: false
        });
    }
} else {
    checks.push({
        name: '❌ README.md missing',
        status: false
    });
}

// Print Results
console.log('\n📊 Results Summary:');
checks.forEach(check => {
    console.log(`   ${check.name}`);
});

const passed = checks.filter(c => c.status).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\n🎯 Production Readiness Score: ${passed}/${total} (${percentage}%)`);

if (percentage >= 90) {
    console.log('🎉 Excellent! Your application is production-ready!');
} else if (percentage >= 70) {
    console.log('⚠️  Good progress, but address the failing checks before deployment.');
} else {
    console.log('❌ Please address the issues before proceeding to production.');
}

console.log('\n🚀 Next Steps:');
console.log('   1. Review DEPLOYMENT_CHECKLIST.md');
console.log('   2. Set up production environment variables');
console.log('   3. Deploy backend to Railway/Render/Heroku');
console.log('   4. Deploy frontend to Vercel/Netlify');
console.log('   5. Test your live application!');