/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, query, addDoc, serverTimestamp, orderBy, updateDoc, deleteDoc, arrayUnion, getDocs, where, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Zap, Cloud, Droplets, Leaf, Shield, IndianRupee, Tractor, BrainCircuit, Bot, MessageSquare,
  Phone, Search, Star, Trash2, Siren, MapPin, Layers, FilePlus, Milestone, Wallet, Target,
  Percent, Wrench, ShoppingBag, Plus, Bell, TrendingUp, TrendingDown, Calendar, CheckSquare, Square,
  Microscope, Pill, Lightbulb, BookUser, ArrowUp, ArrowDown, Send, Settings, Volume2, Globe, UploadCloud, Sun, Wind, X, Mic, VolumeX
} from 'lucide-react';

// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const appId = firebaseConfig.appId;

let app, db, auth, storage;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// --- i18n & Language Management ---
const translations = {
    'en-IN': {
        dashboard: "Dashboard",
        weather: "Weather",
        soilHealth: "Soil Health",
        cropHealthAI: "Crop Health AI",
        cropAdvisorAI: "Crop Advisor AI",
        agriMarketAI: "Agri-Market AI",
        govtSchemesAI: "Govt. Schemes AI",
        cropBudgetAI: "Crop Budget AI",
        agriMachineryAI: "Agri-Machinery AI",
        farmerHelplineAI: "Farmer Helpline AI",
        welcomeMessage: "Welcome to AgriPulse 360, Farmer!",
        selectLanguage: "Select Your Language",
        // Weather Module
        currentWeather: "Current Weather",
        loadingWeather: "Loading weather...",
        weatherNotFound: "Select a location to view weather.",
        failedToFetchWeather: "Failed to fetch weather:",
        humidity: "Humidity:",
        wind: "Wind:",
        // Soil Health Module
        noPlotsFound: "No plots found.",
        addYourFirstPlot: "Add Your First Plot",
        selectPlot: "Select Plot",
        addSoilReading: "Add Soil Reading",
        healthScore: "Health Score:",
        ph: "pH",
        moisture: "Moisture (%)",
        nitrogen: "Nitrogen (ppm)",
        phosphorus: "Phosphorus (ppm)",
        potassium: "Potassium (ppm)",
        addReading: "Add Reading",
        selectPlotOrAddReading: "Select a plot or add a reading.",
        // Crop Health AI Module
        uploadLeafImage: "Upload Leaf Image",
        analyzeImage: "Analyze Image",
        analyzing: "Analyzing...",
        selectPlotAndImage: "Please select a plot and upload an image.",
        imageAnalysisFailed: "Image analysis failed.",
        couldNotGetDiagnosis: "Could not get a diagnosis from the image.",
        analysisError: "Analysis Error:",
        // Agri Market AI Module
        analyzeCropMarket: "Analyze crop market (e.g., Rice)",
        fetchingMarketData: "Fetching latest market data...",
        marketAnalysis: "Market analysis is AI-generated based on real-time search data and should be used for informational purposes.",
        strategy: "Strategy:",
        priceRange: "Price Range:",
        demand: "Demand:",
        priceTrend: "Price Trend:",
        volatility: "Volatility:",
        failedToGetAnalysis: "Failed to get analysis. Please try again later.",
        livePrices: "Live Prices",
        location: "Location:",
        // Agri Machinery AI Module
        selectMachine: "Select Machine",
        describeIssue: "Describe Issue",
        getDiagnosis: "Get Diagnosis",
        aiThinking: "AI is thinking...",
        diagnosisFor: "Diagnosis for",
        failedToGetAnalysisMachinery: "Failed to get analysis. Please try again.",
        // Farmer Helpline AI Module
        yourState: "Your State",
        loanForTractor: "e.g., 'Loan for tractor'",
        findingTheRightHelp: "Finding the right help...",
        recommendedHelplines: "Recommended Helplines:",
        nationalKisanCallCentre: "National Kisan Call Centre",
        couldNotProcessRequest: "Could not process your request. Please try a different query.",
        // Modals
        addNewPlot: "Add New Plot",
        plotName: "Plot Name",
        currentCrop: "Current Crop",
        addPlot: "Add Plot",
        addNewMachinery: "Add New Machinery",
        machineName: "Machine Name / Model",
        machineType: "Machine Type",
        addMachinery: "Add Machinery",
        // Chatbot
        askKisanSahayak: "Ask KisanSahayak...",
        havingTroubleConnecting: "I'm having trouble connecting to the AI. Please try again.",
    },
    'hi-IN': {
        dashboard: "डैशबोर्ड",
        weather: "मौसम",
        soilHealth: "मृदा स्वास्थ्य",
        cropHealthAI: "फसल स्वास्थ्य AI",
        cropAdvisorAI: "फसल सलाहकार AI",
        agriMarketAI: "कृषि-बाजार AI",
        govtSchemesAI: "सरकारी योजनाएं AI",
        cropBudgetAI: "फसल बजट AI",
        agriMachineryAI: "कृषि-मशीनरी AI",
        farmerHelplineAI: "किसान हेल्पलाइन AI",
        welcomeMessage: "एग्रीपल्स 360 में आपका स्वागत है, किसान!",
        selectLanguage: "अपनी भाषा चुनें",
        // Weather Module
        currentWeather: "वर्तमान मौसम",
        loadingWeather: "मौसम लोड हो रहा है...",
        weatherNotFound: "मौसम देखने के लिए एक स्थान चुनें।",
        failedToFetchWeather: "मौसम प्राप्त करने में विफल:",
        humidity: "आर्द्रता:",
        wind: "हवा:",
        // Soil Health Module
        noPlotsFound: "कोई प्लॉट नहीं मिला।",
        addYourFirstPlot: "अपना पहला प्लॉट जोड़ें",
        selectPlot: "प्लॉट चुनें",
        addSoilReading: "मृदा रीडिंग जोड़ें",
        healthScore: "स्वास्थ्य स्कोर:",
        ph: "पीएच",
        moisture: "नमी (%)",
        nitrogen: "नाइट्रोजन (पीपीएम)",
        phosphorus: "फास्फोरस (पीपीएम)",
        potassium: "पोटेशियम (पीपीएम)",
        addReading: "रीडिंग जोड़ें",
        selectPlotOrAddReading: "एक प्लॉट चुनें या एक रीडिंग जोड़ें।",
        // Crop Health AI Module
        uploadLeafImage: "पत्ती की छवि अपलोड करें",
        analyzeImage: "छवि का विश्लेषण करें",
        analyzing: "विश्लेषण कर रहा है...",
        selectPlotAndImage: "कृपया एक प्लॉट चुनें और एक छवि अपलोड करें।",
        imageAnalysisFailed: "छवि विश्लेषण विफल रहा।",
        couldNotGetDiagnosis: "छवि से निदान प्राप्त नहीं किया जा सका।",
        analysisError: "विश्लेषण त्रुटि:",
        // Agri Market AI Module
        analyzeCropMarket: "फसल बाजार का विश्लेषण करें (जैसे, चावल)",
        fetchingMarketData: "नवीनतम बाजार डेटा प्राप्त कर रहा है...",
        marketAnalysis: "बाजार विश्लेषण वास्तविक समय के खोज डेटा पर आधारित AI-जनित है और इसे सूचनात्मक उद्देश्यों के लिए उपयोग किया जाना चाहिए।",
        strategy: "रणनीति:",
        priceRange: "मूल्य सीमा:",
        demand: "मांग:",
        priceTrend: "मूल्य प्रवृत्ति:",
        volatility: "अस्थिरता:",
        failedToGetAnalysis: "विश्लेषण प्राप्त करने में विफल। कृपया बाद में पुनः प्रयास करें।",
        livePrices: "लाइव कीमतें",
        location: "स्थान:",
        // Agri Machinery AI Module
        selectMachine: "मशीन चुनें",
        describeIssue: "समस्या का वर्णन करें",
        getDiagnosis: "निदान प्राप्त करें",
        aiThinking: "एआई सोच रहा है...",
        diagnosisFor: "के लिए निदान",
        failedToGetAnalysisMachinery: "विश्लेषण प्राप्त करने में विफल। कृपया बाद में पुनः प्रयास करें।",
        // Farmer Helpline AI Module
        yourState: "आपका राज्य",
        loanForTractor: "जैसे, 'ट्रैक्टर के लिए ऋण'",
        findingTheRightHelp: "सही संपर्क ढूंढ रहा है...",
        recommendedHelplines: "अनुशंसित हेल्पलाइन:",
        nationalKisanCallCentre: "राष्ट्रीय किसान कॉल सेंटर",
        couldNotProcessRequest: "आपके अनुरोध को संसाधित नहीं किया जा सका। कृपया एक अलग प्रश्न का प्रयास करें।",
        // Modals
        addNewPlot: "नया प्लॉट जोड़ें",
        plotName: "प्लॉट का नाम",
        currentCrop: "वर्तमान फसल",
        addPlot: "प्लॉट जोड़ें",
        addNewMachinery: "नई मशीनरी जोड़ें",
        machineName: "मशीन का नाम / मॉडल",
        machineType: "मशीन का प्रकार",
        addMachinery: "मशीनरी जोड़ें",
        // Chatbot
        askKisanSahayak: "किसान सहायक से पूछें...",
        havingTroubleConnecting: "एआई से कनेक्ट करने में मुझे समस्या हो रही है। कृपया फिर से प्रयास करें।",
    },
     'ml-IN': {
        dashboard: "ഡാഷ്ബോർഡ്",
        weather: "കാലാവസ്ഥ",
        soilHealth: "മണ്ണിന്റെ ആരോഗ്യം",
        cropHealthAI: "വിള ആരോഗ്യ AI",
        cropAdvisorAI: "വിള ഉപദേശക AI",
        agriMarketAI: "അഗ്രി-മാർക്കറ്റ് AI",
        govtSchemesAI: "സർക്കാർ പദ്ധതികൾ AI",
        cropBudgetAI: "വിള ബജറ്റ് AI",
        agriMachineryAI: "കാർഷിക യന്ത്രങ്ങൾ AI",
        farmerHelplineAI: "കർഷക ഹെൽപ്പ് ലൈൻ AI",
        welcomeMessage: "അഗ്രിപൾസ് 360-ലേക്ക് സ്വാഗതം, കർഷകാ!",
        selectLanguage: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
        // Weather Module
        currentWeather: "നിലവിലെ കാലാവസ്ഥ",
        loadingWeather: "കാലാവസ്ഥ ലോഡുചെയ്യുന്നു...",
        weatherNotFound: "കാലാവസ്ഥ കാണാൻ ഒരു സ്ഥലം തിരഞ്ഞെടുക്കുക.",
        failedToFetchWeather: "കാലാവസ്ഥ ലഭ്യമാക്കുന്നതിൽ പരാജയപ്പെട്ടു:",
        humidity: "ഈർപ്പം:",
        wind: "കാറ്റ്:",
        // Soil Health Module
        noPlotsFound: "പ്ലോട്ടുകളൊന്നും കണ്ടെത്തിയില്ല.",
        addYourFirstPlot: "നിങ്ങളുടെ ആദ്യ പ്ലോട്ട് ചേർക്കുക",
        selectPlot: "പ്ലോട്ട് തിരഞ്ഞെടുക്കുക",
        addSoilReading: "മണ്ണ് റീഡിംഗ് ചേർക്കുക",
        healthScore: "ആരോഗ്യ സ്കോർ:",
        ph: "pH",
        moisture: "ഈർപ്പം (%)",
        nitrogen: "നൈട്രജൻ (ppm)",
        phosphorus: "ഫോസ്ഫറസ് (ppm)",
        potassium: "പൊട്ടാസ്യം (ppm)",
        addReading: "റീഡിംഗ് ചേർക്കുക",
        selectPlotOrAddReading: "ഒരു പ്ലോട്ട് തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ ഒരു റീഡിംഗ് ചേർക്കുക.",
        // Crop Health AI Module
        uploadLeafImage: "ഇലയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
        analyzeImage: "ചിത്രം വിശകലനം ചെയ്യുക",
        analyzing: "വിശകലനം ചെയ്യുന്നു...",
        selectPlotAndImage: "ദയവായി ഒരു പ്ലോട്ട് തിരഞ്ഞെടുത്ത് ഒരു ചിത്രം അപ്‌ലോഡ് ചെയ്യുക.",
        imageAnalysisFailed: "ചിത്ര വിശകലനം പരാജയപ്പെട്ടു.",
        couldNotGetDiagnosis: "ചിത്രത്തിൽ നിന്ന് ഒരു രോഗനിർണയം നേടാനായില്ല.",
        analysisError: "വിശകലന പിശക്:",
        // Agri Market AI Module
        analyzeCropMarket: "വിള വിപണി വിശകലനം ചെയ്യുക (ഉദാ: അരി)",
        fetchingMarketData: "ഏറ്റവും പുതിയ മാർക്കറ്റ് ഡാറ്റ ലഭ്യമാക്കുന്നു...",
        marketAnalysis: "മാർക്കറ്റ് വിശകലനം തത്സമയ തിരയൽ ഡാറ്റയെ അടിസ്ഥാനമാക്കിയുള്ള AI- ജനറേറ്റഡ് ആണ്, ഇത് വിവര ആവശ്യങ്ങൾക്കായി ഉപയോഗിക്കണം.",
        strategy: "തന്ത്രം:",
        priceRange: "വില പരിധി:",
        demand: "ആവശ്യം:",
        priceTrend: "വില പ്രവണത:",
        volatility: "അസ്ഥിരത:",
        failedToGetAnalysis: "വിശകലനം ലഭിക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക.",
        livePrices: "തത്സമയ വിലകൾ",
        location: "സ്ഥലം:",
        // Agri Machinery AI Module
        selectMachine: "മെഷീൻ തിരഞ്ഞെടുക്കുക",
        describeIssue: "പ്രശ്നം വിവരിക്കുക",
        getDiagnosis: "രോഗനിർണയം നേടുക",
        aiThinking: "AI ചിന്തിക്കുന്നു...",
        diagnosisFor: "നുള്ള രോഗനിർണയം",
        failedToGetAnalysisMachinery: "വിശകലനം ലഭിക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക.",
        // Farmer Helpline AI Module
        yourState: "നിങ്ങളുടെ സംസ്ഥാനം",
        loanForTractor: "ഉദാ: 'ട്രാക്ടറിനായുള്ള ലോൺ'",
        findingTheRightHelp: "ശരിയായ സഹായം കണ്ടെത്തുന്നു...",
        recommendedHelplines: "ശുപാർശ ചെയ്യുന്ന ഹെൽപ്പ് ലൈനുകൾ:",
        nationalKisanCallCentre: "ദേശീയ കിസാൻ കോൾ സെന്റർ",
        couldNotProcessRequest: "നിങ്ങളുടെ അഭ്യർത്ഥന പ്രോസസ്സ് ചെയ്യാനായില്ല. ദയവായി മറ്റൊരു ചോദ്യം ശ്രമിക്കുക.",
        // Modals
        addNewPlot: "പുതിയ പ്ലോട്ട് ചേർക്കുക",
        plotName: "പ്ലോട്ടിന്റെ പേര്",
        currentCrop: "നിലവിലെ വിള",
        addPlot: "പ്ലോട്ട് ചേർക്കുക",
        addNewMachinery: "പുതിയ യന്ത്രങ്ങൾ ചേർക്കുക",
        machineName: "യന്ത്രത്തിന്റെ പേര് / മോഡൽ",
        machineType: "യന്ത്രത്തിന്റെ തരം",
        addMachinery: "യന്ത്രങ്ങൾ ചേർക്കുക",
        // Chatbot
        askKisanSahayak: "കിസാൻ സഹായക് ചോദിക്കുക...",
        havingTroubleConnecting: "AI-യുമായി ബന്ധിപ്പിക്കുന്നതിൽ എനിക്ക് പ്രശ്നമുണ്ട്. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
    },
    'te-IN': {
        dashboard: "డాష్‌బోర్డ్",
        weather: "వాతావరణం",
        soilHealth: "నేల ఆరోగ్యం",
        cropHealthAI: "పంట ఆరోగ్యం AI",
        cropAdvisorAI: "పంట సలహాదారు AI",
        agriMarketAI: "వ్యవసాయ-మార్కెట్ AI",
        govtSchemesAI: "ప్రభుత్వ పథకాలు AI",
        cropBudgetAI: "పంట బడ్జెట్ AI",
        agriMachineryAI: "వ్యవసాయ యంత్రాలు AI",
        farmerHelplineAI: "రైతు హెల్ప్‌లైన్ AI",
        welcomeMessage: "అగ్రిపల్స్ 360కి స్వాగతం, రైతు!",
        selectLanguage: "మీ భాషను ఎంచుకోండి",
        currentWeather: "ప్రస్తుత వాతావరణం",
        loadingWeather: "వాతావరణం లోడ్ అవుతోంది...",
        weatherNotFound: "వాతావరణం చూడటానికి ఒక ప్రదేశాన్ని ఎంచుకోండి.",
        failedToFetchWeather: "వాతావరణాన్ని పొందడంలో విఫలమైంది:",
        humidity: "తేమ:",
        wind: "గాలి:",
        noPlotsFound: "ప్లాట్లు ఏవీ కనుగొనబడలేదు.",
        addYourFirstPlot: "మీ మొదటి ప్లాట్‌ను జోడించండి",
        selectPlot: "ప్లాట్‌ను ఎంచుకోండి",
        addSoilReading: "నేల రీడింగ్‌ను జోడించండి",
        healthScore: "ఆరోగ్య స్కోరు:",
        ph: "pH",
        moisture: "తేమ (%)",
        nitrogen: "నత్రజని (ppm)",
        phosphorus: "భాస్వరం (ppm)",
        potassium: "పొటాషియం (ppm)",
        addReading: "రీడింగ్ జోడించండి",
        selectPlotOrAddReading: "ఒక ప్లాట్‌ను ఎంచుకోండి లేదా రీడింగ్ జోడించండి.",
        uploadLeafImage: "ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి",
        analyzeImage: "చిత్రాన్ని విశ్లేషించండి",
        analyzing: "విశ్లేషిస్తోంది...",
        selectPlotAndImage: "దయచేసి ఒక ప్లాట్‌ను ఎంచుకుని, ఒక చిత్రాన్ని అప్‌లోడ్ చేయండి.",
        imageAnalysisFailed: "చిత్ర విశ్లేషణ విఫలమైంది.",
        couldNotGetDiagnosis: "చిత్రం నుండి నిర్ధారణ పొందడం సాధ్యం కాలేదు.",
        analysisError: "విశ్లేషణ లోపం:",
        analyzeCropMarket: "పంట మార్కెట్‌ను విశ్లేషించండి (ఉదా., వరి)",
        fetchingMarketData: "తాజా మార్కెట్ డేటాను పొందుతోంది...",
        marketAnalysis: "మార్కెట్ విశ్లేషణ నిజ-సమయ శోధన డేటాపై ఆధారపడిన AI- రూపొందించబడింది మరియు సమాచార ప్రయోజనాల కోసం ఉపయోగించాలి.",
        strategy: "వ్యూహం:",
        priceRange: "ధర పరిధి:",
        demand: "డిమాండ్:",
        priceTrend: "ధర ధోరణి:",
        volatility: "అస్థిరత:",
        failedToGetAnalysis: "విశ్లేషణ పొందడంలో విఫలమైంది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.",
        livePrices: "ప్రత్యక్ష ధరలు",
        location: "ప్రదేశం:",
        selectMachine: "యంత్రాన్ని ఎంచుకోండి",
        describeIssue: "సమస్యను వివరించండి",
        getDiagnosis: "నిర్ధారణ పొందండి",
        aiThinking: "AI ఆలోచిస్తోంది...",
        diagnosisFor: "కోసం నిర్ధారణ",
        failedToGetAnalysisMachinery: "విశ్లేషణ పొందడంలో విఫలమైంది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.",
        yourState: "మీ రాష్ట్రం",
        loanForTractor: "ఉదా., 'ట్రాక్టర్ కోసం రుణం'",
        findingTheRightHelp: "సరైన సహాయాన్ని కనుగొంటోంది...",
        recommendedHelplines: "సిఫార్సు చేయబడిన హెల్ప్‌లైన్‌లు:",
        nationalKisanCallCentre: "జాతీయ కిసాన్ కాల్ సెంటర్",
        couldNotProcessRequest: "మీ అభ్యర్థనను ప్రాసెస్ చేయడం సాధ్యం కాలేదు. దయచేసి వేరే ప్రశ్నను ప్రయత్నించండి.",
        addNewPlot: "కొత్త ప్లాట్‌ను జోడించండి",
        plotName: "ప్లాట్ పేరు",
        currentCrop: "ప్రస్తుత పంట",
        addPlot: "ప్లాట్ జోడించండి",
        addNewMachinery: "కొత్త యంత్రాలను జోడించండి",
        machineName: "యంత్రం పేరు / మోడల్",
        machineType: "యంత్రం రకం",
        addMachinery: "యంత్రాలను జోడించండి",
        askKisanSahayak: "కిసాన్‌సహాయక్‌ని అడగండి...",
        havingTroubleConnecting: "AIకి కనెక్ట్ చేయడంలో నాకు సమస్య ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
    },
    'ta-IN': {
        dashboard: "டாஷ்போர்டு",
        weather: "வானிலை",
        soilHealth: "மண் வளம்",
        cropHealthAI: "பயிர் ஆரோக்கியம் AI",
        cropAdvisorAI: "பயிர் ஆலோசகர் AI",
        agriMarketAI: "விவசாய-சந்தை AI",
        govtSchemesAI: "அரசு திட்டங்கள் AI",
        cropBudgetAI: "பயிர் பட்ஜெட் AI",
        agriMachineryAI: "விவசாய இயந்திரங்கள் AI",
        farmerHelplineAI: "உழவர் உதவி எண் AI",
        welcomeMessage: "அக்ரிபல்ஸ் 360க்கு வரவேற்கிறோம், விவசாயி!",
        selectLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
        // Weather Module
        currentWeather: "தற்போதைய வானிலை",
        loadingWeather: "வானிலை ஏற்றுகிறது...",
        weatherNotFound: "வானிலை காண ஒரு இடத்தைத் தேர்ந்தெடுக்கவும்.",
        failedToFetchWeather: "வானிலையைப் பெறுவதில் தோல்வி:",
        humidity: "ஈரப்பதம்:",
        wind: "காற்று:",
        // Soil Health Module
        noPlotsFound: "மனைகள் எதுவும் இல்லை.",
        addYourFirstPlot: "உங்கள் முதல் மனையைச் சேர்க்கவும்",
        selectPlot: "மனையைத் தேர்ந்தெடுக்கவும்",
        addSoilReading: "மண் வாசிப்பைச் சேர்க்கவும்",
        healthScore: "சுகாதார மதிப்பெண்:",
        ph: "pH",
        moisture: "ஈரப்பதம் (%)",
        nitrogen: "நைட்ரஜன் (ppm)",
        phosphorus: "பாஸ்பரஸ் (ppm)",
        potassium: "பொட்டாசியம் (ppm)",
        addReading: "வாசிப்பைச் சேர்",
        selectPlotOrAddReading: "ஒரு மனையைத் தேர்ந்தெடுக்கவும் அல்லது ஒரு வாசிப்பைச் சேர்க்கவும்.",
        // Crop Health AI Module
        uploadLeafImage: "இலை படத்தை பதிவேற்றவும்",
        analyzeImage: "படத்தை பகுப்பாய்வு செய்யவும்",
        analyzing: "பகுப்பாய்வு செய்கிறது...",
        selectPlotAndImage: "தயவுசெய்து ஒரு மனையைத் தேர்ந்தெடுத்து ஒரு படத்தைப் பதிவேற்றவும்.",
        imageAnalysisFailed: "பட பகுப்பாய்வு தோல்வியடைந்தது.",
        couldNotGetDiagnosis: "படத்திலிருந்து ஒரு நோயறிதலைப் பெற முடியவில்லை.",
        analysisError: "பகுப்பாய்வு பிழை:",
        // Agri Market AI Module
        analyzeCropMarket: "பயிர் சந்தையை பகுப்பாய்வு செய்யுங்கள் (எ.கா., அரிசி)",
        fetchingMarketData: "சமீபத்திய சந்தைத் தரவைப் பெறுகிறது...",
        marketAnalysis: "சந்தை பகுப்பாய்வு என்பது நிகழ்நேர தேடல் தரவின் அடிப்படையில் AI-உருவாக்கப்பட்டது மற்றும் தகவல் நோக்கங்களுக்காகப் பயன்படுத்தப்பட வேண்டும்.",
        strategy: "உத்தி:",
        priceRange: "விலை வரம்பு:",
        demand: "தேவை:",
        priceTrend: "விலைப் போக்கு:",
        volatility: "நிலையற்ற தன்மை:",
        failedToGetAnalysis: "பகுப்பாய்வைப் பெற முடியவில்லை. பிறகு மீண்டும் முயற்சிக்கவும்.",
        livePrices: "நேரடி விலைகள்",
        location: "இடம்:",
        // Agri Machinery AI Module
        selectMachine: "இயந்திரத்தைத் தேர்ந்தெடுக்கவும்",
        describeIssue: "சிக்கலை விவரிக்கவும்",
        getDiagnosis: "நோயறிதலைப் பெறுங்கள்",
        aiThinking: "AI சிந்திக்கிறது...",
        diagnosisFor: "க்கான நோயறிதல்",
        failedToGetAnalysisMachinery: "பகுப்பாய்வைப் பெற முடியவில்லை. பிறகு மீண்டும் முயற்சிக்கவும்.",
        // Farmer Helpline AI Module
        yourState: "உங்கள் மாநிலம்",
        loanForTractor: "எ.கா., 'டிராக்டருக்கான கடன்'",
        findingTheRightHelp: "சரியான உதவியைக் கண்டறிகிறது...",
        recommendedHelplines: "பரிந்துரைக்கப்பட்ட உதவி எண்கள்:",
        nationalKisanCallCentre: "தேசிய கிசான் அழைப்பு மையம்",
        couldNotProcessRequest: "உங்கள் கோரிக்கையைச் செயல்படுத்த முடியவில்லை. வேறு வினவலை முயற்சிக்கவும்.",
        // Modals
        addNewPlot: "புதிய மனையைச் சேர்",
        plotName: "மனையின் பெயர்",
        currentCrop: "தற்போதைய பயிர்",
        addPlot: "மனையைச் சேர்",
        addNewMachinery: "புதிய இயந்திரத்தைச் சேர்",
        machineName: "இயந்திரத்தின் பெயர் / மாடல்",
        machineType: "இயந்திரத்தின் வகை",
        addMachinery: "இயந்திரத்தைச் சேர்",
        // Chatbot
        askKisanSahayak: "கிசான்சகாயக்கிடம் கேளுங்கள்...",
        havingTroubleConnecting: "AI உடன் இணைப்பதில் சிக்கல் உள்ளது. மீண்டும் முயற்சிக்கவும்.",
    },
    'bn-BD': {
        dashboard: "ড্যাশবোর্ড",
        weather: "আবহাওয়া",
        soilHealth: "মাটির স্বাস্থ্য",
        cropHealthAI: "ফসল স্বাস্থ্য AI",
        cropAdvisorAI: "ফসল উপদেষ্টা AI",
        agriMarketAI: "কৃষি-বাজার AI",
        govtSchemesAI: "সরকারি স্কিম AI",
        cropBudgetAI: "ফসল বাজেট AI",
        agriMachineryAI: "কৃষি যন্ত্রপাতি AI",
        farmerHelplineAI: "কৃষক হেল্পলাইন AI",
        welcomeMessage: "এগ্রিপালস ৩৬০-এ স্বাগতম, কৃষক!",
        selectLanguage: "আপনার ভাষা নির্বাচন করুন",
        // Weather Module
        currentWeather: "বর্তমান আবহাওয়া",
        loadingWeather: "আবহাওয়া লোড হচ্ছে...",
        weatherNotFound: "আবহাওয়া দেখতে একটি অবস্থান নির্বাচন করুন।",
        failedToFetchWeather: "আবহাওয়া আনতে ব্যর্থ হয়েছে:",
        humidity: "আর্দ্রতা:",
        wind: "বায়ু:",
        // Soil Health Module
        noPlotsFound: "কোন প্লট পাওয়া যায়নি।",
        addYourFirstPlot: "আপনার প্রথম প্লট যোগ করুন",
        selectPlot: "প্লট নির্বাচন করুন",
        addSoilReading: "মাটির রিডিং যোগ করুন",
        healthScore: "স্বাস্থ্য স্কোর:",
        ph: "পিএইচ",
        moisture: "আর্দ্রতা (%)",
        nitrogen: "নাইট্রোজেন (পিপিএম)",
        phosphorus: "ফসফরাস (পিপিএম)",
        potassium: "পটাশিয়াম (পিপিএম)",
        addReading: "রিডিং যোগ করুন",
        selectPlotOrAddReading: "একটি প্লট নির্বাচন করুন বা একটি রিডিং যোগ করুন।",
        // Crop Health AI Module
        uploadLeafImage: "পাতার ছবি আপলোড করুন",
        analyzeImage: "ছবি বিশ্লেষণ করুন",
        analyzing: "বিশ্লেষণ করা হচ্ছে...",
        selectPlotAndImage: "অনুগ্রহ করে একটি প্লট নির্বাচন করুন এবং একটি ছবি আপলোড করুন।",
        imageAnalysisFailed: "ছবি বিশ্লেষণ ব্যর্থ হয়েছে।",
        couldNotGetDiagnosis: "ছবি থেকে রোগ নির্ণয় করা যায়নি।",
        analysisError: "বিশ্লেষণ ত্রুটি:",
        // Agri Market AI Module
        analyzeCropMarket: "ফসলের বাজার বিশ্লেষণ করুন (যেমন, চাল)",
        fetchingMarketData: "সর্বশেষ বাজার তথ্য আনা হচ্ছে...",
        marketAnalysis: "বাজার বিশ্লেষণ রিয়েল-টাইম সার্চ ডেটার উপর ভিত্তি করে AI-জেনারেটেড এবং এটি তথ্যগত উদ্দেশ্যে ব্যবহার করা উচিত।",
        strategy: "কৌশল:",
        priceRange: "মূল্য পরিসীমা:",
        demand: "চাহিদা:",
        priceTrend: "মূল্যের প্রবণতা:",
        volatility: "অস্থিরতা:",
        failedToGetAnalysis: "বিশ্লেষণ পেতে ব্যর্থ। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
        livePrices: "লাইভ মূল্য",
        location: "অবস্থান:",
        // Agri Machinery AI Module
        selectMachine: "মেশিন নির্বাচন করুন",
        describeIssue: "সমস্যা বর্ণনা করুন",
        getDiagnosis: "রোগ নির্ণয় করুন",
        aiThinking: "এআই ভাবছে...",
        diagnosisFor: "এর জন্য রোগ নির্ণয়",
        failedToGetAnalysisMachinery: "বিশ্লেষণ পেতে ব্যর্থ। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
        // Farmer Helpline AI Module
        yourState: "আপনার রাজ্য",
        loanForTractor: "যেমন, 'ট্রাক্টরের জন্য ঋণ'",
        findingTheRightHelp: "সঠিক সাহায্য খোঁজা হচ্ছে...",
        recommendedHelplines: "প্রস্তাবিত হেল্পলাইন:",
        nationalKisanCallCentre: "জাতীয় কিষাণ কল সেন্টার",
        couldNotProcessRequest: "আপনার অনুরোধ প্রক্রিয়া করা যায়নি। অনুগ্রহ করে একটি ভিন্ন প্রশ্ন চেষ্টা করুন।",
        // Modals
        addNewPlot: "নতুন প্লট যোগ করুন",
        plotName: "প্লটের নাম",
        currentCrop: "বর্তমান ফসল",
        addPlot: "প্লট যোগ করুন",
        addNewMachinery: "নতুন যন্ত্রপাতি যোগ করুন",
        machineName: "মেশিনের নাম / মডেল",
        machineType: "মেশিনের প্রকার",
        addMachinery: "যন্ত্রপাতি যোগ করুন",
        // Chatbot
        askKisanSahayak: "কিষাণ সহায়ককে জিজ্ঞাসা করুন...",
        havingTroubleConnecting: "এআই-এর সাথে সংযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    },
    'mr-IN': {
        dashboard: "डॅशबोर्ड",
        weather: "हवामान",
        soilHealth: "मातीचे आरोग्य",
        cropHealthAI: "पीक आरोग्य AI",
        cropAdvisorAI: "पीक सल्लागार AI",
        agriMarketAI: "कृषी-बाजार AI",
        govtSchemesAI: "सरकारी योजना AI",
        cropBudgetAI: "पीक बजेट AI",
        agriMachineryAI: "कृषी यंत्रसामग्री AI",
        farmerHelplineAI: "शेतकरी हेल्पलाइन AI",
        welcomeMessage: "अ‍ॅग्रीपल्स ३६० मध्ये आपले स्वागत आहे, शेतकरी!",
        selectLanguage: "तुमची भाषा निवडा",
        // Weather Module
        currentWeather: "सध्याचे हवामान",
        loadingWeather: "हवामान लोड होत आहे...",
        weatherNotFound: "हवामान पाहण्यासाठी स्थान निवडा.",
        failedToFetchWeather: "हवामान आणण्यात अयशस्वी:",
        humidity: "आर्द्रता:",
        wind: "वारा:",
        // Soil Health Module
        noPlotsFound: "कोणतेही प्लॉट आढळले नाहीत.",
        addYourFirstPlot: "तुमचा पहिला प्लॉट जोडा",
        selectPlot: "प्लॉट निवडा",
        addSoilReading: "मातीचे रीडिंग जोडा",
        healthScore: "आरोग्य गुण:",
        ph: "pH",
        moisture: "आर्द्रता (%)",
        nitrogen: "नायट्रोजन (ppm)",
        phosphorus: "फॉस्फरस (ppm)",
        potassium: "पोटॅशियम (ppm)",
        addReading: "रीडिंग जोडा",
        selectPlotOrAddReading: "एक प्लॉट निवडा किंवा रीडिंग जोडा.",
        // Crop Health AI Module
        uploadLeafImage: "पानाचे चित्र अपलोड करा",
        analyzeImage: "चित्राचे विश्लेषण करा",
        analyzing: "विश्लेषण करत आहे...",
        selectPlotAndImage: "कृपया एक प्लॉट निवडा आणि एक चित्र अपलोड करा.",
        imageAnalysisFailed: "चित्र विश्लेषण अयशस्वी झाले.",
        couldNotGetDiagnosis: "चित्रातून निदान मिळू शकले नाही.",
        analysisError: "विश्लेषण त्रुटी:",
        // Agri Market AI Module
        analyzeCropMarket: "पीक बाजाराचे विश्लेषण करा (उदा. तांदूळ)",
        fetchingMarketData: "नवीनतम बाजार डेटा आणत आहे...",
        marketAnalysis: "बाजार विश्लेषण रिअल-टाइम शोध डेटावर आधारित AI-व्युत्पन्न आहे आणि ते माहितीच्या उद्देशाने वापरले पाहिजे.",
        strategy: "रणनीती:",
        priceRange: "किंमत श्रेणी:",
        demand: "मागणी:",
        priceTrend: "किंमत ट्रेंड:",
        volatility: "अस्थिरता:",
        failedToGetAnalysis: "विश्लेषण मिळविण्यात अयशस्वी. कृपया नंतर पुन्हा प्रयत्न करा.",
        livePrices: "थेट किंमती",
        location: "स्थान:",
        // Agri Machinery AI Module
        selectMachine: "मशीन निवडा",
        describeIssue: "समस्या वर्णन करा",
        getDiagnosis: "निदान मिळवा",
        aiThinking: "AI विचार करत आहे...",
        diagnosisFor: "साठी निदान",
        failedToGetAnalysisMachinery: "विश्लेषण मिळविण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
        // Farmer Helpline AI Module
        yourState: "तुमचे राज्य",
        loanForTractor: "उदा., 'ट्रॅक्टरसाठी कर्ज'",
        findingTheRightHelp: "योग्य मदत शोधत आहे...",
        recommendedHelplines: "शिफारस केलेले हेल्पलाइन:",
        nationalKisanCallCentre: "राष्ट्रीय किसान कॉल सेंटर",
        couldNotProcessRequest: "तुमची विनंती प्रक्रिया होऊ शकली नाही. कृपया वेगळी क्वेरी वापरून पहा.",
        // Modals
        addNewPlot: "नवीन प्लॉट जोडा",
        plotName: "प्लॉटचे नाव",
        currentCrop: "सध्याचे पीक",
        addPlot: "प्लॉट जोडा",
        addNewMachinery: "नवीन यंत्रसामग्री जोडा",
        machineName: "मशीनचे नाव / मॉडेल",
        machineType: "मशीनचा प्रकार",
        addMachinery: "यंत्रसामग्री जोडा",
        // Chatbot
        askKisanSahayak: "किसानसहायकला विचारा...",
        havingTroubleConnecting: "AI शी कनेक्ट करण्यात समस्या येत आहे. कृपया पुन्हा प्रयत्न करा.",
    },
    'kn-IN': {
        dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        weather: "ಹವಾಮಾನ",
        soilHealth: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
        cropHealthAI: "ಬೆಳೆ ಆರೋಗ್ಯ AI",
        cropAdvisorAI: "ಬೆಳೆ ಸಲಹೆಗಾರ AI",
        agriMarketAI: "ಕೃಷಿ-ಮಾರುಕಟ್ಟೆ AI",
        govtSchemesAI: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು AI",
        cropBudgetAI: "ಬೆಳೆ ಬಜೆಟ್ AI",
        agriMachineryAI: "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ AI",
        farmerHelplineAI: "ರೈತ ಸಹಾಯವಾಣಿ AI",
        welcomeMessage: "ಅಗ್ರಿಪಲ್ಸ್ 360 ಗೆ ಸ್ವಾಗತ, ರೈತ!",
        selectLanguage: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        // Weather Module
        currentWeather: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ",
        loadingWeather: "ಹವಾಮಾನ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        weatherNotFound: "ಹವಾಮಾನ ವೀಕ್ಷಿಸಲು একটি ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        failedToFetchWeather: "ಹವಾಮಾನವನ್ನು ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ:",
        humidity: "ತೇವಾಂಶ:",
        wind: "ಗಾಳಿ:",
        // Soil Health Module
        noPlotsFound: "ಯಾವುದೇ ಪ್ಲಾಟ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
        addYourFirstPlot: "ನಿಮ್ಮ ಮೊದಲ ಪ್ಲಾಟ್ ಸೇರಿಸಿ",
        selectPlot: "ಪ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ",
        addSoilReading: "ಮಣ್ಣಿನ ರೀಡಿಂಗ್ ಸೇರಿಸಿ",
        healthScore: "ಆರೋಗ್ಯ ಸ್ಕೋರ್:",
        ph: "pH",
        moisture: "ತೇವಾಂಶ (%)",
        nitrogen: "ಸಾರಜನಕ (ppm)",
        phosphorus: "ರಂಜಕ (ppm)",
        potassium: "פּೊಟ್ಯಾಸಿಯಮ್ (ppm)",
        addReading: "ರೀಡಿಂಗ್ ಸೇರಿಸಿ",
        selectPlotOrAddReading: "ಒಂದು ಪ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ರೀಡಿಂಗ್ ಸೇರಿಸಿ.",
        // Crop Health AI Module
        uploadLeafImage: "ಎಲೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
        analyzeImage: "ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
        analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
        selectPlotAndImage: "ದಯವಿಟ್ಟು ಒಂದು ಪ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
        imageAnalysisFailed: "ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ.",
        couldNotGetDiagnosis: "ಚಿತ್ರದಿಂದ ರೋಗನಿರ್ಣಯವನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        analysisError: "ವಿಶ್ಲೇಷಣೆ ದೋಷ:",
        // Agri Market AI Module
        analyzeCropMarket: "ಬೆಳೆ ಮಾರುಕಟ್ಟೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ (ಉದಾ., ಅಕ್ಕಿ)",
        fetchingMarketData: "ಇತ್ತೀಚಿನ ಮಾರುಕಟ್ಟೆ ಡೇಟಾವನ್ನು ತರಲಾಗುತ್ತಿದೆ...",
        marketAnalysis: "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆಯು ನೈಜ-ಸಮಯದ ಹುಡುಕಾಟ ಡೇಟಾವನ್ನು ಆಧರಿಸಿ AI-ರಚಿಸಲಾಗಿದೆ ಮತ್ತು ಇದನ್ನು ಮಾಹಿತಿ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಬಳಸಬೇಕು.",
        strategy: "ಕಾರ್ಯತಂತ್ರ:",
        priceRange: "ಬೆಲೆ ಶ್ರೇಣಿ:",
        demand: "ಬೇಡಿಕೆ:",
        priceTrend: "ಬೆಲೆ ಪ್ರವೃತ್ತಿ:",
        volatility: "ಅಸ್ಥಿರತೆ:",
        failedToGetAnalysis: "ವಿಶ್ಲೇಷಣೆಯನ್ನು ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        livePrices: "ಲೈವ್ ಬೆಲೆಗಳು",
        location: "ಸ್ಥಳ:",
        // Agri Machinery AI Module
        selectMachine: "ಯಂತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        describeIssue: "ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ",
        getDiagnosis: "ರೋಗನಿರ್ಣಯವನ್ನು ಪಡೆಯಿರಿ",
        aiThinking: "AI ಯೋಚಿಸುತ್ತಿದೆ...",
        diagnosisFor: "ಗಾಗಿ ರೋಗನಿರ್ಣಯ",
        failedToGetAnalysisMachinery: "ವಿಶ್ಲೇಷಣೆಯನ್ನು ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        // Farmer Helpline AI Module
        yourState: "ನಿಮ್ಮ ರಾಜ್ಯ",
        loanForTractor: "ಉದಾ., 'ಟ್ರಾಕ್ಟರ್‌ಗಾಗಿ ಸಾಲ'",
        findingTheRightHelp: "ಸರಿಯಾದ ಸಹಾಯವನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
        recommendedHelplines: "ಶಿಫಾರಸು ಮಾಡಲಾದ ಸಹಾಯವಾಣಿಗಳು:",
        nationalKisanCallCentre: "ರಾಷ್ಟ್ರೀಯ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್",
        couldNotProcessRequest: "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಪ್ರಶ್ನೆಯನ್ನು ಪ್ರಯತ್ನಿಸಿ.",
        // Modals
        addNewPlot: "ಹೊಸ ಪ್ಲಾಟ್ ಸೇರಿಸಿ",
        plotName: "ಪ್ಲಾಟ್ ಹೆಸರು",
        currentCrop: "ಪ್ರಸ್ತುತ ಬೆಳೆ",
        addPlot: "ಪ್ಲಾಟ್ ಸೇರಿಸಿ",
        addNewMachinery: "ಹೊಸ ಯಂತ್ರೋಪಕರಣಗಳನ್ನು ಸೇರಿಸಿ",
        machineName: "ಯಂತ್ರದ ಹೆಸರು / ಮಾದರಿ",
        machineType: "ಯಂತ್ರದ ಪ್ರಕಾರ",
        addMachinery: "ಯಂತ್ರೋಪಕರಣಗಳನ್ನು ಸೇರಿಸಿ",
        // Chatbot
        askKisanSahayak: "ಕಿಸಾನ್‌ಸಹಾಯಕ್ ಕೇಳಿ...",
        havingTroubleConnecting: "AI ಗೆ ಸಂಪರ್ಕಿಸಲು ನನಗೆ ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    },
    'gu-IN': {
        dashboard: "ડેશબોર્ડ",
        weather: "હવામાન",
        soilHealth: "જમીનનું સ્વાસ્થ્ય",
        cropHealthAI: "પાક આરોગ્ય AI",
        cropAdvisorAI: "પાક સલાહકાર AI",
        agriMarketAI: "કૃષિ-બજાર AI",
        govtSchemesAI: "સરકારી યોજનાઓ AI",
        cropBudgetAI: "પાક બજેટ AI",
        agriMachineryAI: "કૃષિ મશીનરી AI",
        farmerHelplineAI: "ખેડૂત હેલ્પલાઇન AI",
        welcomeMessage: "એગ્રીપલ્સ ૩૬૦ માં આપનું સ્વાગત છે, ખેડૂત!",
        selectLanguage: "તમારી ભાષા પસંદ કરો",
        // Weather Module
        currentWeather: "વર્તમાન હવામાન",
        loadingWeather: "હવામાન લોડ થઈ રહ્યું છે...",
        weatherNotFound: "હવામાન જોવા માટે સ્થાન પસંદ કરો.",
        failedToFetchWeather: "હવામાન મેળવવામાં નિષ્ફળ:",
        humidity: "ભેજ:",
        wind: "પવન:",
        // Soil Health Module
        noPlotsFound: "કોઈ પ્લોટ મળ્યાં નથી.",
        addYourFirstPlot: "તમારો પ્રથમ પ્લોટ ઉમેરો",
        selectPlot: "પ્લોટ પસંદ કરો",
        addSoilReading: "જમીનનું રીડિંગ ઉમેરો",
        healthScore: "આરોગ્ય સ્કોર:",
        ph: "pH",
        moisture: "ભેજ (%)",
        nitrogen: "નાઇટ્રોજન (ppm)",
        phosphorus: "ફોસ્ફરસ (ppm)",
        potassium: "પોટેશિયમ (ppm)",
        addReading: "રીડિંગ ઉમેરો",
        selectPlotOrAddReading: "એક પ્લોટ પસંદ કરો અથવા રીડિંગ ઉમેરો.",
        // Crop Health AI Module
        uploadLeafImage: "પાનની છબી અપલોડ કરો",
        analyzeImage: "છબીનું વિશ્લેષણ કરો",
        analyzing: "વિશ્લેષણ કરી રહ્યું છે...",
        selectPlotAndImage: "કૃપા કરીને એક પ્લોટ પસંદ કરો અને એક છબી અપલોડ કરો.",
        imageAnalysisFailed: "છબી વિશ્લેષણ નિષ્ફળ ગયું.",
        couldNotGetDiagnosis: "છબીમાંથી નિદાન મેળવી શકાયું નથી.",
        analysisError: "વિશ્લેષણ ભૂલ:",
        // Agri Market AI Module
        analyzeCropMarket: "પાક બજારનું વિશ્લેષણ કરો (દા.ત., ચોખા)",
        fetchingMarketData: "નવીનતમ બજાર ડેટા મેળવી રહ્યું છે...",
        marketAnalysis: "બજાર વિશ્લેષણ વાસ્તવિક-સમયના શોધ ડેટા પર આધારિત AI-જનરેટેડ છે અને તેનો ઉપયોગ માહિતીના હેતુઓ માટે થવો જોઈએ.",
        strategy: "વ્યૂહરચના:",
        priceRange: "કિંમત શ્રેણી:",
        demand: "માંગ:",
        priceTrend: "કિંમતનું વલણ:",
        volatility: "અસ્થિરતા:",
        failedToGetAnalysis: "વિશ્લેષણ મેળવવામાં નિષ્ફળ. કૃપા કરીને પછીથી ફરી પ્રયાસ કરો.",
        livePrices: "લાઇવ ભાવો",
        location: "સ્થાન:",
        // Agri Machinery AI Module
        selectMachine: "મશીન પસંદ કરો",
        describeIssue: "સમસ્યાનું વર્ણન કરો",
        getDiagnosis: "નિદાન મેળવો",
        aiThinking: "AI વિચારી રહ્યું છે...",
        diagnosisFor: "માટે નિદાન",
        failedToGetAnalysisMachinery: "વિશ્લેષણ મેળવવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.",
        // Farmer Helpline AI Module
        yourState: "તમારું રાજ્ય",
        loanForTractor: "દા.ત., 'ટ્રેક્ટર માટે લોન'",
        findingTheRightHelp: "સાચી મદદ શોધી રહ્યું છે...",
        recommendedHelplines: "ભલામણ કરેલ હેલ્પલાઇન:",
        nationalKisanCallCentre: "રાષ્ટ્રીય કિસાન કોલ સેન્ટર",
        couldNotProcessRequest: "તમારી વિનંતી પર પ્રક્રિયા કરી શકાઈ નથી. કૃપા કરીને એક અલગ ક્વેરીનો પ્રયાસ કરો.",
        // Modals
        addNewPlot: "નવો પ્લોટ ઉમેરો",
        plotName: "પ્લોટનું નામ",
        currentCrop: "વર્તમાન પાક",
        addPlot: "પ્લોટ ઉમેરો",
        addNewMachinery: "નવી મશીનરી ઉમેરો",
        machineName: "મશીનનું નામ / મોડેલ",
        machineType: "મશીનનો પ્રકાર",
        addMachinery: "મશીનરી ઉમેરો",
        // Chatbot
        askKisanSahayak: "કિસાનસહાયકને પૂછો...",
        havingTroubleConnecting: "મને AI સાથે જોડાવામાં મુશ્કેલી આવી રહી છે. કૃપા કરીને ફરી પ્રયાસ કરો.",
    },
    'pa-IN': {
        dashboard: "ਡੈਸ਼ਬੋਰਡ",
        weather: "ਮੌਸਮ",
        soilHealth: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ",
        cropHealthAI: "ਫਸਲ ਸਿਹਤ AI",
        cropAdvisorAI: "ਫਸਲ ਸਲਾਹਕਾਰ AI",
        agriMarketAI: "ਐਗਰੀ-ਮਾਰਕੀਟ AI",
        govtSchemesAI: "ਸਰਕਾਰੀ ਸਕੀਮਾਂ AI",
        cropBudgetAI: "ਫਸਲ ਬਜਟ AI",
        agriMachineryAI: "ਖੇਤੀਬਾੜੀ ਮਸ਼ੀਨਰੀ AI",
        farmerHelplineAI: "ਕਿਸਾਨ ਹੈਲਪਲਾਈਨ AI",
        welcomeMessage: "ਐਗਰੀਪਲਸ 360 ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ, ਕਿਸਾਨ!",
        selectLanguage: "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ",
        // Weather Module
        currentWeather: "ਮੌਜੂਦਾ ਮੌਸਮ",
        loadingWeather: "ਮੌਸਮ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
        weatherNotFound: "ਮੌਸਮ ਦੇਖਣ ਲਈ ਇੱਕ ਸਥਾਨ ਚੁਣੋ।",
        failedToFetchWeather: "ਮੌਸਮ ਪ੍ਰਾਪਤ ਕਰਨ ਵਿੱਚ ਅਸਫਲ:",
        humidity: "ਨਮੀ:",
        wind: "ਹਵਾ:",
        // Soil Health Module
        noPlotsFound: "ਕੋਈ ਪਲਾਟ ਨਹੀਂ ਮਿਲਿਆ।",
        addYourFirstPlot: "ਆਪਣਾ ਪਹਿਲਾ ਪਲਾਟ ਸ਼ਾਮਲ ਕਰੋ",
        selectPlot: "ਪਲਾਟ ਚੁਣੋ",
        addSoilReading: "ਮਿੱਟੀ ਦੀ ਰੀਡਿੰਗ ਸ਼ਾਮਲ ਕਰੋ",
        healthScore: "ਸਿਹਤ ਸਕੋਰ:",
        ph: "pH",
        moisture: "ਨਮੀ (%)",
        nitrogen: "ਨਾਈਟ੍ਰੋਜਨ (ppm)",
        phosphorus: "ਫਾਸਫੋਰਸ (ppm)",
        potassium: "ਪੋਟਾਸ਼ੀਅਮ (ppm)",
        addReading: "ਰੀਡਿੰਗ ਸ਼ਾਮਲ ਕਰੋ",
        selectPlotOrAddReading: "ਇੱਕ ਪਲਾਟ ਚੁਣੋ ਜਾਂ ਇੱਕ ਰੀਡਿੰਗ ਸ਼ਾਮਲ ਕਰੋ।",
        // Crop Health AI Module
        uploadLeafImage: "ਪੱਤੇ ਦੀ ਤਸਵੀਰ ਅੱਪਲੋਡ ਕਰੋ",
        analyzeImage: "ਤਸਵੀਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
        analyzing: "ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...",
        selectPlotAndImage: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਪਲਾਟ ਚੁਣੋ ਅਤੇ ਇੱਕ ਤਸਵੀਰ ਅੱਪਲੋਡ ਕਰੋ।",
        imageAnalysisFailed: "ਚਿੱਤਰ ਵਿਸ਼ਲੇਸ਼ਣ ਅਸਫਲ ਰਿਹਾ।",
        couldNotGetDiagnosis: "ਚਿੱਤਰ ਤੋਂ ਨਿਦਾਨ ਪ੍ਰਾਪਤ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ।",
        analysisError: "ਵਿਸ਼ਲੇਸ਼ਣ ਗਲਤੀ:",
        // Agri Market AI Module
        analyzeCropMarket: "ਫਸਲ ਬਾਜ਼ਾਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ (ਜਿਵੇਂ, ਚਾਵਲ)",
        fetchingMarketData: "ਨਵੀਨਤਮ ਮਾਰਕੀਟ ਡੇਟਾ ਪ੍ਰਾਪਤ ਕਰ ਰਿਹਾ ਹੈ...",
        marketAnalysis: "ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ ਰੀਅਲ-ਟਾਈਮ ਖੋਜ ਡੇਟਾ 'ਤੇ ਅਧਾਰਤ ਏਆਈ-ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਹੈ ਅਤੇ ਇਸਦੀ ਵਰਤੋਂ ਜਾਣਕਾਰੀ ਦੇ ਉਦੇਸ਼ਾਂ ਲਈ ਕੀਤੀ ਜਾਣੀ ਚਾਹੀਦੀ ਹੈ।",
        strategy: "ਰਣਨੀਤੀ:",
        priceRange: "ਕੀਮਤ ਸੀਮਾ:",
        demand: "ਮੰਗ:",
        priceTrend: "ਕੀਮਤ ਦਾ ਰੁਝਾਨ:",
        volatility: "ਅਸਥਿਰਤਾ:",
        failedToGetAnalysis: "ਵਿਸ਼ਲੇਸ਼ਣ ਪ੍ਰਾਪਤ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
        livePrices: "ਲਾਈਵ ਕੀਮਤਾਂ",
        location: "ਸਥਾਨ:",
        // Agri Machinery AI Module
        selectMachine: "ਮਸ਼ੀਨ ਚੁਣੋ",
        describeIssue: "ਮੁੱਦੇ ਦਾ ਵਰਣਨ ਕਰੋ",
        getDiagnosis: "ਨਿਦਾਨ ਪ੍ਰਾਪਤ ਕਰੋ",
        aiThinking: "AI ਸੋਚ ਰਿਹਾ ਹੈ...",
        diagnosisFor: "ਲਈ ਨਿਦਾਨ",
        failedToGetAnalysisMachinery: "ਵਿਸ਼ਲੇਸ਼ਣ ਪ੍ਰਾਪਤ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
        // Farmer Helpline AI Module
        yourState: "ਤੁਹਾਡਾ ਰਾਜ",
        loanForTractor: "ਜਿਵੇਂ, 'ਟਰੈਕਟਰ ਲਈ ਕਰਜ਼ਾ'",
        findingTheRightHelp: "ਸਹੀ ਮਦਦ ਲੱਭ ਰਿਹਾ ਹੈ...",
        recommendedHelplines: "ਸਿਫ਼ਾਰਿਸ਼ ਕੀਤੀਆਂ ਹੈਲਪਲਾਈਨਾਂ:",
        nationalKisanCallCentre: "ਰਾਸ਼ਟਰੀ ਕਿਸਾਨ ਕਾਲ ਸੈਂਟਰ",
        couldNotProcessRequest: "ਤੁਹਾਡੀ ਬੇਨਤੀ 'ਤੇ ਕਾਰਵਾਈ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕੀ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੱਖਰੀ ਪੁੱਛਗਿੱਛ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
        // Modals
        addNewPlot: "ਨਵਾਂ ਪਲਾਟ ਸ਼ਾਮਲ ਕਰੋ",
        plotName: "ਪਲਾਟ ਦਾ ਨਾਮ",
        currentCrop: "ਮੌਜੂਦਾ ਫਸਲ",
        addPlot: "ਪਲਾਟ ਸ਼ਾਮਲ ਕਰੋ",
        addNewMachinery: "ਨਵੀਂ ਮਸ਼ੀਨਰੀ ਸ਼ਾਮਲ ਕਰੋ",
        machineName: "ਮਸ਼ੀਨ ਦਾ ਨਾਮ / ਮਾਡਲ",
        machineType: "ਮਸ਼ੀਨ ਦੀ ਕਿਸਮ",
        addMachinery: "ਮਸ਼ੀਨਰੀ ਸ਼ਾਮਲ ਕਰੋ",
        // Chatbot
        askKisanSahayak: "ਕਿਸਾਨ ਸਹਾਇਕ ਨੂੰ ਪੁੱਛੋ...",
        havingTroubleConnecting: "ਮੈਨੂੰ AI ਨਾਲ ਜੁੜਨ ਵਿੱਚ ਮੁਸ਼ਕਲ ਆ ਰਹੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    },
};

const LanguageContext = createContext();
const useLanguage = () => useContext(LanguageContext);

const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('kisan-suvidha-lang') || 'en-IN');
    const [isLangModalOpen, setIsLangModalOpen] = useState(!localStorage.getItem('kisan-suvidha-lang'));

    const handleSetLanguage = (langCode) => {
        setLanguage(langCode);
        localStorage.setItem('kisan-suvidha-lang', langCode);
        setIsLangModalOpen(false);
    };

    const t = (key) => translations[language]?.[key] || translations['en-IN'][key] || key;
    
    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isLangModalOpen, setIsLangModalOpen }}>
            {children}
        </LanguageContext.Provider>
    );
};


// --- Constants & Static Data ---
const OPENWEATHER_API_KEY = "9f44421718645b350d7164e36778f917";
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const DEFAULT_LOCATION_NAME = "Visakhapatnam";
const DEFAULT_STATE_NAME = "Andhra Pradesh";

const ALL_STATES_DATA = {
    "Andhra Pradesh": ["Alluri Sitharama Raju", "Anakapalli", "Anantapur", "Annamayya", "Bapatla", "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur", "Kakinada", "Krishna", "Kurnool", "Nandyal", "NTR", "Palnadu", "Parvathipuram Manyam", "Prakasam", "Sri Potti Sriramulu Nellore", "Sri Sathya Sai", "Srikakulam", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
    "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke-Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang", "Capital Complex Itanagar"],
    "Assam": ["Bajali", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tamulpur", "Tinsukia", "Udalguri", "West Karbi Anglong"],
    "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
    "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Khairagarh-Chhuikhadan-Gandai", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sarangarh-Bilaigarh", "Shakti", "Sukma", "Surajpur", "Surguja"],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
    "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
    "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
    "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
    "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Vijayanagara", "Yadgir"],
    "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
    "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad (Narmadapuram)", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
    "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad (Chhatrapati Sambhaji Nagar)", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad (Dharashiv)", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
    "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
    "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "Eastern West Khasi Hills", "North Garo Hills", "Ri-Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
    "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
    "Nagaland": ["Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyü", "Tuensang", "Wokha", "Zunheboto"],
    "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
    "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
    "Rajasthan": ["Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran", "Barmer", "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Deeg", "Dholpur", "Didwana-Kuchaman", "Dudu", "Dungarpur", "Ganganagar", "Gangapur City", "Hanumangarh", "Jaipur", "Jaipur Rural", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Jodhpur Rural", "Karauli", "Kekri", "Khairthal-Tijara", "Kota", "Kotputli-Behror", "Nagaur", "Neem Ka Thana", "Pali", "Phalodi", "Pratapgarh", "Rajsamand", "Salumbar", "Sanchore", "Sawai Madhopur", "Shahpura", "Sikar", "Sirohi", "Tonk", "Udaipur"],
    "Sikkim": ["East Sikkim", "North Sikkim", "Pakyong", "Soreng", "South Sikkim", "West Sikkim"],
    "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
    "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal–Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadri Bhuvanagiri"],
    "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
    "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddh Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
    "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
    "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]
};

const CROP_DATA_SOIL = {
  "None": { ph: [0, 14], moisture: [0, 100], nitrogen: [0, 200], phosphorus: [0, 100], potassium: [0, 250] },
  "Rice": { ph: [6.0, 7.0], moisture: [70, 80], nitrogen: [100, 150], phosphorus: [40, 60], potassium: [150, 200] },
  "Wheat": { ph: [6.0, 7.0], moisture: [60, 70], nitrogen: [120, 180], phosphorus: [50, 70], potassium: [100, 150] },
  "Cotton": { ph: [6.0, 7.5], moisture: [50, 60], nitrogen: [80, 120], phosphorus: [30, 50], potassium: [100, 150] },
  "Maize": { ph: [5.5, 7.0], moisture: [60, 70], nitrogen: [100, 150], phosphorus: [40, 60], potassium: [100, 150] },
  "Sugarcane": { ph: [6.0, 7.5], moisture: [70, 80], nitrogen: [150, 200], phosphorus: [50, 70], potassium: [200, 250] },
  "Chilli": { ph: [6.0, 7.0], moisture: [60, 70], nitrogen: [80, 120], phosphorus: [40, 60], potassium: [100, 150] },
  "Turmeric": { ph: [5.0, 7.5], moisture: [60, 70], nitrogen: [80, 120], phosphorus: [30, 60], potassium: [120, 180] },
  "Groundnut": { ph: [6.0, 7.0], moisture: [50, 60], nitrogen: [20, 40], phosphorus: [40, 60], potassium: [50, 80] },
  "Soybean": { ph: [6.0, 7.0], moisture: [50, 65], nitrogen: [20, 40], phosphorus: [40, 60], potassium: [80, 120] },
  "Coffee": { ph: [6.0, 6.5], moisture: [60, 70], nitrogen: [100, 150], phosphorus: [30, 50], potassium: [120, 180] },
  "Pepper": { ph: [5.5, 6.5], moisture: [65, 75], nitrogen: [80, 120], phosphorus: [30, 50], potassium: [100, 150] },
  "Cardamom": { ph: [4.5, 6.0], moisture: [70, 80], nitrogen: [70, 100], phosphorus: [20, 40], potassium: [80, 120] },
  "Rubber": { ph: [4.5, 6.0], moisture: [60, 70], nitrogen: [90, 120], phosphorus: [30, 50], potassium: [80, 120] },
  "Coconut": { ph: [5.0, 8.0], moisture: [60, 70], nitrogen: [50, 80], phosphorus: [20, 40], potassium: [100, 150] },
};

const MARKET_CROPS = ['Rice', 'Cotton', 'Chilli', 'Turmeric', 'Maize', 'Groundnut', 'Wheat', 'Sugarcane', 'Soybean', 'Coffee', 'Pepper', 'Cardamom', 'Rubber', 'Coconut'];


// --- TTS Helper Functions ---
const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
const pcmToWav = (pcmData, sampleRate) => {
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit PCM
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    const writeString = (v, offset, str) => { for (let i = 0; i < str.length; i++) { v.setUint8(offset + i, str.charCodeAt(i)); } };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.byteLength, true);
    return new Blob([wavHeader, pcmData], { type: 'audio/wav' });
};

const LANGUAGES = {
    'English (India)': { code: 'en-IN', voice: 'Zephyr' },
    'Hindi': { code: 'hi-IN', voice: 'Kore' },
    'Bengali': { code: 'bn-BD', voice: 'Puck' },
    'Marathi': { code: 'mr-IN', voice: 'Charon' },
    'Tamil': { code: 'ta-IN', voice: 'Fenrir' },
    'Telugu': { code: 'te-IN', voice: 'Leda' },
    'Malayalam': { code: 'ml-IN', voice: 'Sadachbia' },
    'Kannada': { code: 'kn-IN', voice: 'Orus' },
    'Gujarati': { code: 'gu-IN', voice: 'Aoede' },
    'Punjabi': { code: 'pa-IN', voice: 'Callirrhoe' },
};

// --- API Helper ---
const fetchWithRetry = async (url, options, maxRetries = 3) => {
    let delay = 1000; // Start with 1 second
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
             // Don't retry on client-side errors (4xx), but do on server-side (5xx) or rate limit (429)
            if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                 const errorText = await response.text();
                 throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            console.warn(`API call failed with status ${response.status}. Retrying in ${delay / 1000}s...`);
        } catch (error) {
             if (i === maxRetries - 1) throw error; // Rethrow last error
            console.warn(`Network error during API call. Retrying in ${delay / 1000}s...`, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
    }
    throw new Error(`API call failed after ${maxRetries} retries.`);
};


// --- Helper Components ---
const CustomModal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className={`bg-white text-gray-800 p-6 rounded-2xl shadow-lg w-full ${sizeClasses[size]} relative`}>
        <h3 className="text-2xl font-bold mb-4 text-green-700">{title}</h3>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={24}/></button>
        {children}
      </div>
    </div>
  );
};

const SectionCard = ({ title, children, icon: Icon, className = '' }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-200 ${className}`}>
    <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
      {Icon && <Icon size={24} className="text-green-600" />} {title}
    </h2>
    {children}
  </div>
);

// --- New Management Modals ---
const AddPlotModal = ({ isOpen, onClose, userId, db, t }) => {
    const [name, setName] = useState('');
    const [crop, setCrop] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !crop.trim() || !userId) return;
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/plots`), { name, crop, createdAt: serverTimestamp() });
        setName(''); setCrop(''); onClose();
    };
    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title={t('addNewPlot')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm">{t('plotName')}</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., North Field" className="w-full p-2 border rounded" required /></div>
                <div><label className="block text-sm">{t('currentCrop')}</label><input type="text" value={crop} onChange={e => setCrop(e.target.value)} placeholder="e.g., Rice" className="w-full p-2 border rounded" required /></div>
                <button type="submit" className="w-full py-2 bg-green-600 text-white rounded">{t('addPlot')}</button>
            </form>
        </CustomModal>
    );
};

const AddMachineryModal = ({ isOpen, onClose, userId, db, t }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Tractor');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !type.trim() || !userId) return;
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/machinery`), { name, type, maintenanceLogs: [], createdAt: serverTimestamp() });
        setName(''); setType('Tractor'); onClose();
    };
    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title={t('addNewMachinery')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm">{t('machineName')}</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., John Deere 5050D" className="w-full p-2 border rounded" required /></div>
                <div><label className="block text-sm">{t('machineType')}</label><select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded"><option>Tractor</option><option>Harvester</option><option>Sprayer</option><option>Tiller</option><option>Other</option></select></div>
                <button type="submit" className="w-full py-2 bg-green-600 text-white rounded">{t('addMachinery')}</button>
            </form>
        </CustomModal>
    );
};


// --- Module Components (Updated) ---

// 1. Weather Module (State managed at App level now)
const WeatherModule = ({ apiKey, location, setLocation }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();

    const fetchWeather = useCallback(async (city, state) => {
        if (!city) return;
        setLoading(true); setError('');
        try {
            const lang = language.split('-')[0];
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},IN&appid=${apiKey}&units=metric&lang=${lang}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod === 200) setWeather(data);
            else throw new Error(data.message || t('weatherNotFound'));
        } catch (err) { setError(`${t('failedToFetchWeather')} ${err.message}`);
        } finally { setLoading(false); }
    }, [apiKey, t, language]);
    
    useEffect(() => { fetchWeather(location.city, location.state); }, [location, fetchWeather]);
    
    const availableCities = useMemo(() => {
        return ALL_STATES_DATA[location.state] || [];
    }, [location.state]);

    if (loading) return <div className="p-4 text-center">{t('loadingWeather')}</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    const WeatherIcon = weather?.weather[0].main.includes('Cloud') ? Cloud : Sun;

    return (
        <SectionCard title={t('currentWeather')} icon={Cloud}>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
                <select value={location.state} onChange={e => { const newState = e.target.value; setLocation({ state: newState, city: ALL_STATES_DATA[newState]?.[0] || '' }); }} className="flex-grow p-2 border border-gray-300 rounded-md">
                    {Object.keys(ALL_STATES_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={location.city} onChange={e => setLocation({ ...location, city: e.target.value })} className="flex-grow p-2 border border-gray-300 rounded-md">
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            {weather ? (
                <div className="flex flex-col items-center text-center mt-4">
                    <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><MapPin size={28} />{weather.name}</h3>
                    <WeatherIcon size={64} className="text-yellow-500 my-4" />
                    <p className="text-5xl font-extrabold text-green-700">{Math.round(weather.main.temp)}°C</p>
                    <p className="text-xl capitalize text-gray-600">{weather.weather[0].description}</p>
                    <div className="flex justify-around w-full mt-4 text-gray-700">
                        <p className="flex items-center gap-1"><Droplets size={18} /> {t('humidity')} {weather.main.humidity}%</p>
                        <p className="flex items-center gap-1"><Wind size={18} /> {t('wind')} {Math.round(weather.wind.speed)} m/s</p>
                    </div>
                </div>
            ) : (
                <p className="p-4 text-center text-gray-500">{t('weatherNotFound')}</p>
            )}
        </SectionCard>
    );
};


// 5. Agri-Market AI Module (with Grounded Search)
const AgriMarketAIModule = ({ userId, db, location, speakText }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();

    const handleAnalyze = async () => {
        if (!searchQuery.trim()) return;
        setIsAnalyzing(true); setError(''); setAnalysis(null);
        
        const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const systemPrompt = `You are 'MarketMind AI', an agricultural market analyst for Indian farmers. Use your search tool to find the latest market data for today, ${currentDate}. Your response MUST be a single, valid JSON object and nothing else. Do not wrap it in markdown backticks. The JSON object must have these keys: "marketSnapshot" (an object with "priceRange" in INR/quintal and "volatility"), "demandAndTrend" (an object with "demand" and "priceTrend"), "keyDrivers" (an array of strings), and "strategicRecommendation" (an object with "strategy" and "reasoning"). Your entire response must be in the language with this code: ${language}.`;
        const userQuery = `Analyze the market for '${searchQuery}' in '${location.city}, ${location.state}'.`;

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
            
            // This payload correctly uses the Search tool
            const payload = { 
                contents: [{ parts: [{ text: userQuery }] }], 
                systemInstruction: { parts: [{ text: systemPrompt }] }, 
                tools: [{ "google_search": {} }],
            };

            const response = await fetchWithRetry(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorBody)}`);
            }
            
            const result = await response.json();
            let aiResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            // --- PROTECTION 1: This try/catch block safely parses the AI's response ---
            let parsedAnalysis;
            try {
                const jsonStartIndex = aiResponseText.indexOf('{');
                if (jsonStartIndex === -1) {
                    throw new Error("No JSON object found in the AI response.");
                }
                const jsonString = aiResponseText.substring(jsonStartIndex);
                parsedAnalysis = JSON.parse(jsonString.replace(/```json/g, '').replace(/```/g, '').trim());
            } catch (e) {
                console.error("Failed to parse AI response JSON:", e);
                throw new Error("The AI returned data in an invalid format.");
            }

            setAnalysis(parsedAnalysis);

            const speechSummary = `Market analysis for ${searchQuery}. The recommended strategy is to ${parsedAnalysis?.strategicRecommendation?.strategy || 'check the details'}. ${parsedAnalysis?.strategicRecommendation?.reasoning || ''}`;
            speakText(speechSummary);
            
        } catch (err) {
            console.error("Analysis Error:", err);
            setError(`${t('failedToGetAnalysis')} ${err.message}`);
        } finally { 
            setIsAnalyzing(false); 
        }
    };
    
    return (
        <SectionCard title={t('agriMarketAI')} icon={IndianRupee}>
             <p className="text-sm text-gray-500 mb-2">{t('location')} {location.city}, {location.state}</p>
            <div className="flex gap-2 mb-4">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('analyzeCropMarket')} className="flex-grow p-2 border rounded" />
                <button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"><Search size={20} /></button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {isAnalyzing && <p className="text-center p-2 text-gray-600 animate-pulse">{t('fetchingMarketData')}</p>}
            {analysis && (
                <div className="relative mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm animate-fade-in">
                    <button onClick={() => speakText(`Market analysis for ${searchQuery}. The recommended strategy is to ${analysis.strategicRecommendation?.strategy}. ${analysis.strategicRecommendation?.reasoning}`)} className="absolute top-2 right-2 p-1 hover:bg-green-100 rounded-full"><Volume2 size={16}/></button>
                    <p className="font-bold text-base">{searchQuery} Analysis</p>
                    {/* --- PROTECTION 2: Optional chaining (?.) is used below to safely display the data --- */}
                    <p><span className="font-semibold">{t('priceRange')}</span> {analysis.marketSnapshot?.priceRange}</p>
                    <p className="font-semibold">{t('demand')} {analysis.demandAndTrend?.demand}</p>
                    <p className="font-semibold">{t('priceTrend')} {analysis.demandAndTrend?.priceTrend}</p>
                    <p className="font-semibold">{t('volatility')} {analysis.marketSnapshot?.volatility}</p>
                    <p className="font-bold mt-2">{t('strategy')} {analysis.strategicRecommendation?.strategy}</p>
                    <p>{analysis.strategicRecommendation?.reasoning || "Detailed reasoning available."}</p>
                </div>
            )}
             <p className="text-xs text-gray-400 mt-4">{t('marketAnalysis')}</p>
        </SectionCard>
    );
};

// 3. Crop Health AI Module
const CropHealthAIModule = ({ userId, db, storage, appId, openPlotModal, isAuthReady, speakText }) => {
    const [plots, setPlots] = useState([]);
    const [selectedPlotId, setSelectedPlotId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [analysisSummary, setAnalysisSummary] = useState('');
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();

    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, `artifacts/${appId}/users/${userId}/plots`), orderBy('createdAt', 'desc'));
        return onSnapshot(q, snap => {
            const p = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPlots(p);
            if (!selectedPlotId && p.length > 0) setSelectedPlotId(p[0].id);
            else if (selectedPlotId && !p.find(item => item.id === selectedPlotId)) {
                setSelectedPlotId(p.length > 0 ? p[0].id : '');
            }
        });
    }, [userId, db, appId, selectedPlotId]);

    const selectedPlot = useMemo(() => plots.find(p => p.id === selectedPlotId), [plots, selectedPlotId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setAnalysisSummary('');
            setError('');
        }
    };

    const handleAnalyzeImage = async () => {
        if (!imageFile || !selectedPlot || !userId || !db || !storage) {
            setError(t('selectPlotAndImage'));
            return;
        }
        setIsLoadingAnalysis(true);
        setError('');
        setAnalysisSummary('');

        try {
            const base64ImageData = imagePreview.split(',')[1];
            const diagnosisPrompt = `Identify any diseases, pests, or nutrient deficiencies on this ${selectedPlot.crop} leaf. Be specific. If healthy, state that. Provide a concise summary. Respond in the language with this code: ${language}.`;
            const visionApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

            const visionPayload = { contents: [{ parts: [{ text: diagnosisPrompt }, { inlineData: { mimeType: imageFile.type, data: base64ImageData } }] }] };
            const visionResponse = await fetchWithRetry(visionApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(visionPayload) });
            if (!visionResponse.ok) throw new Error(t('imageAnalysisFailed'));
            const visionResult = await visionResponse.json();
            const diagnosis = (visionResult.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/\*/g, '');

            if (!diagnosis) throw new Error(t('couldNotGetDiagnosis'));
            setAnalysisSummary(diagnosis);
            speakText(diagnosis);

            const storageRef = ref(storage, `artifacts/${appId}/public/data/uploads/${userId}_${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/plots/${selectedPlot.id}/scoutingLogs`), {
                imageUrl,
                diagnosis,
                crop: selectedPlot.crop,
                createdAt: serverTimestamp(),
            });

        } catch (err) {
            console.error(`${t('analysisError')} `, err);
             if (err.message.includes('storage/unauthorized')) {
                setError(`Image upload failed due to a permission issue. Please check Firebase rules.`);
             } else {
                setError(`${t('analysisError')} ${err.message}`);
             }
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    return (
        <SectionCard title={t('cropHealthAI')} icon={Leaf}>
            {plots.length > 0 ? (
                 <div className="flex gap-2 mb-4">
                    <select
                        value={selectedPlotId || ''}
                        onChange={e => setSelectedPlotId(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-md"
                    >
                        {plots.map(p => <option key={p.id} value={p.id}>{p.name} ({p.crop})</option>)}
                    </select>
                </div>
            ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">{t('noPlotsFound')}</p>
                    <button onClick={openPlotModal} className="mt-2 text-sm text-green-600 font-semibold hover:underline">{t('addYourFirstPlot')}</button>
                </div>
            )}
           

            <label htmlFor="image-upload" className="cursor-pointer block w-full p-4 border-2 border-dashed border-gray-300 rounded-md text-center hover:border-green-500 transition">
                <UploadCloud className="mx-auto h-8 w-8 text-gray-500" />
                <span className="mt-2 block text-sm font-semibold text-gray-600">{imageFile ? imageFile.name : t('uploadLeafImage')}</span>
                <input id="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
            </label>
            {imagePreview && <img src={imagePreview} alt="Preview" className="rounded-md w-full h-32 object-cover mt-4" />}

            <button onClick={handleAnalyzeImage} disabled={!imageFile || !selectedPlot || isLoadingAnalysis || !isAuthReady} className="w-full mt-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                {isLoadingAnalysis ? t('analyzing') : t('analyzeImage')}
            </button>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {analysisSummary && 
                <div className="relative mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
                    <button onClick={() => speakText(analysisSummary)} className="absolute top-2 right-2 p-1 hover:bg-green-100 rounded-full"><Volume2 size={16}/></button>
                    {analysisSummary}
                </div>
            }
        </SectionCard>
    );
};

// 4. Crop Advisor AI Module
const CropAdvisorAIModule = ({ userId, db, speakText }) => {
    const [formData, setFormData] = useState({ nitrogen: 50, phosphorus: 50, potassium: 50, ph: 6.5, temperature: 28, humidity: 70, rainfall: 100, });
    const [recommendation, setRecommendation] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();


    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError('');
        setRecommendation(null);

        const systemPrompt = `You are 'AgroIntellect AI', an expert agronomist. Task: recommend the best crop based on soil and environmental conditions. Respond in JSON with keys: "primaryCrop" (name, suitabilityScore, reasoning), "alternativeCrops" (array of name, reasoning), "growthBlueprint" (idealConditions, plantingAdvice, challenges), "economicOutlook" (marketValue, potentialYield). Your response must be in the language with this code: ${language}.`;
        const userQuery = `Location: ${DEFAULT_LOCATION_NAME}. Soil & environment data:\n- N: ${formData.nitrogen} kg/ha\n- P: ${formData.phosphorus} kg/ha\n- K: ${formData.potassium} kg/ha\n- pH: ${formData.ph}\n- Temp: ${formData.temperature}°C\n- Humidity: ${formData.humidity}%\n- Rainfall: ${formData.rainfall} mm. Recommend best crop.`;

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetchWithRetry(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json" } }) });
            if (!response.ok) throw new Error("AI analysis failed.");
            const result = await response.json();
            const aiResponseText = (result.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/\*/g, '');
            if (!aiResponseText) throw new Error("Could not get a recommendation.");
            const parsedRecommendation = JSON.parse(aiResponseText);
            setRecommendation(parsedRecommendation);
            speakText(`Based on the data, the primary recommended crop is ${parsedRecommendation.primaryCrop.name}. ${parsedRecommendation.primaryCrop.reasoning}`);


            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/recommendations`), { inputs: formData, recommendation: parsedRecommendation, location: DEFAULT_LOCATION_NAME, createdAt: serverTimestamp() });
        } catch (err) {
            console.error(`${t('analysisError')} `, err);
            setError(`${t('failedToGetAnalysis')} ${err.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <SectionCard title={t('cropAdvisorAI')} icon={Lightbulb}>
            <div className="space-y-3">
                <div><label className="text-sm">{t('nitrogen')} (kg/ha)</label><input type="number" value={formData.nitrogen} onChange={e => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) })} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm">{t('phosphorus')} (kg/ha)</label><input type="number" value={formData.phosphorus} onChange={e => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) })} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm">{t('potassium')} (kg/ha)</label><input type="number" value={formData.potassium} onChange={e => setFormData({ ...formData, potassium: parseFloat(e.target.value) })} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm">{t('ph')}</label><input type="number" step="0.1" value={formData.ph} onChange={e => setFormData({ ...formData, ph: parseFloat(e.target.value) })} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm">Temperature (°C)</label><input type="number" value={formData.temperature} onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) })} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm">{t('humidity')}</label><input type="number" value={formData.humidity} onChange={e => setFormData({ ...formData, humidity: parseFloat(e.target.value) })} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm">Rainfall (mm)</label><input type="number" value={formData.rainfall} onChange={e => setFormData({ ...formData, rainfall: parseFloat(e.target.value) })} className="w-full p-2 border rounded" /></div>
            </div>
            <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                {isAnalyzing ? t('analyzing') : "Get Recommendation"}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {recommendation && (
                 <div className="relative mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
                    <button onClick={() => speakText(`The primary recommended crop is ${recommendation.primaryCrop.name}. ${recommendation.primaryCrop.reasoning}`)} className="absolute top-2 right-2 p-1 hover:bg-green-100 rounded-full"><Volume2 size={16}/></button>
                    <p className="font-bold">Primary Crop: {recommendation.primaryCrop.name} ({recommendation.primaryCrop.suitabilityScore}%)</p>
                    <p>{typeof recommendation.primaryCrop.reasoning === 'string' ? recommendation.primaryCrop.reasoning : "Detailed reasoning available."}</p>
                </div>
            )}
        </SectionCard>
    );
};

// 5. Agri-Market AI Module (with Grounded Search)
const AgriMarketAIModule = ({ userId, db, location, speakText }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();

const handleAnalyze = async () => {
    if (!searchQuery.trim()) return;
    setIsAnalyzing(true); setError(''); setAnalysis(null);
    
    const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Updated prompt: Removed mention of the search tool
    const systemPrompt = `You are 'MarketMind AI', an agricultural market analyst for Indian farmers. Based on your training data up to your last update, provide a market analysis for today, ${currentDate}. Your response MUST be a single, valid JSON object with these keys: "marketSnapshot" (with "priceRange" in INR/quintal and "volatility"), "demandAndTrend" (with "demand" and "priceTrend"), "keyDrivers" (an array of strings), and "strategicRecommendation" (with "strategy" and "reasoning"). Respond in the language with this code: ${language}.`;
    const userQuery = `Analyze the market for '${searchQuery}' in '${location.city}, ${location.state}'.`;

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
        
        // This payload forces JSON output but REMOVES the search tool
        const payload = { 
            contents: [{ parts: [{ text: userQuery }] }], 
            systemInstruction: { parts: [{ text: systemPrompt }] }, 
            generationConfig: {
                responseMimeType: "application/json",
            }
        };

        const response = await fetchWithRetry(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorBody)}`);
        }
        
        const result = await response.json();
        
        const aiResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsedAnalysis = JSON.parse(aiResponseText);

        if (Object.keys(parsedAnalysis).length === 0) {
             throw new Error("The AI returned an empty analysis. Please try a different query.");
        }

        setAnalysis(parsedAnalysis);

        const speechSummary = `Market analysis for ${searchQuery}. The recommended strategy is to ${parsedAnalysis?.strategicRecommendation?.strategy || 'check the details'}. ${parsedAnalysis?.strategicRecommendation?.reasoning || ''}`;
        speakText(speechSummary);
        
    } catch (err) {
        console.error("Analysis Error:", err);
        setError(`${t('failedToGetAnalysis')} ${err.message}`);
    } finally { 
        setIsAnalyzing(false); 
    }
};
                          
    return (
        <SectionCard title={t('agriMarketAI')} icon={IndianRupee}>
             <p className="text-sm text-gray-500 mb-2">{t('location')} {location.city}, {location.state}</p>
            <div className="flex gap-2 mb-4">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('analyzeCropMarket')} className="flex-grow p-2 border rounded" />
                <button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"><Search size={20} /></button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {isAnalyzing && <p className="text-center p-2 text-gray-600 animate-pulse">{t('fetchingMarketData')}</p>}
            {analysis && (
                <div className="relative mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm animate-fade-in">
                    <button onClick={() => speakText(`Market analysis for ${searchQuery}. The recommended strategy is to ${analysis.strategicRecommendation.strategy}. ${analysis.strategicRecommendation.reasoning}`)} className="absolute top-2 right-2 p-1 hover:bg-green-100 rounded-full"><Volume2 size={16}/></button>
                    <p className="font-bold text-base">{searchQuery} Analysis</p>
                    <p><span className="font-semibold">{t('priceRange')}</span> {analysis.marketSnapshot?.priceRange}</p>
                    <p className="font-semibold">{t('demand')} {analysis.demandAndTrend?.demand}</p>
                    <p className="font-semibold">{t('priceTrend')} {analysis.demandAndTrend?.priceTrend}</p>
                    <p className="font-semibold">{t('volatility')} {analysis.marketSnapshot?.volatility}</p>
                    <p className="font-bold mt-2">{t('strategy')} {analysis.strategicRecommendation?.strategy}</p>
                    <p>{typeof analysis.strategicRecommendation?.reasoning === 'string' ? analysis.strategicRecommendation.reasoning : "Detailed reasoning available."}</p>
                </div>
            )}
             <p className="text-xs text-gray-400 mt-4">{t('marketAnalysis')}</p>
        </SectionCard>
    );
};

// 6. Govt. Schemes AI Module
const GramSevaAIModule = ({ userId, db, speakText }) => {
    const [form, setForm] = useState({ state: DEFAULT_STATE_NAME, farmerType: 'Small', crop: 'Rice', need: 'Crop Insurance' });
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();


    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError('');
        setAnalysis(null);

        const systemPrompt = `You are 'GramSeva AI', an expert on Indian government agricultural schemes (current as of Sep 2025). Identify and rank relevant schemes. Respond in JSON with key 'recommendedSchemes', an array of objects. Each object must have: 'schemeName', 'relevanceScore' (0-100), 'summary', 'category', 'keyBenefits' (array), 'eligibilityCriteria', 'applicationProcess'. Your entire response must be in the language with this code: ${language}.`;
        const userQuery = `I am a farmer in ${form.state}. I am a ${form.farmerType} farmer, primarily growing ${form.crop}. I am looking for schemes related to '${form.need}'. Provide relevant central and state government schemes.`;

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetchWithRetry(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json" } }) });
            if (!response.ok) throw new Error("AI analysis failed.");
            const result = await response.json();
            const aiResponseText = (result.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/\*/g, '');
            if (!aiResponseText) throw new Error("Could not get recommendations.");
            const parsedAnalysis = JSON.parse(aiResponseText);
            setAnalysis(parsedAnalysis);
            speakText(`I found ${parsedAnalysis.recommendedSchemes.length} relevant schemes. The top recommendation is ${parsedAnalysis.recommendedSchemes[0].schemeName}. ${parsedAnalysis.recommendedSchemes[0].summary}`);
        } catch (err) {
            console.error("Analysis Error:", err);
            setError(`${t('failedToGetAnalysis')} ${err.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <SectionCard title={t('govtSchemesAI')} icon={Shield}>
            <div className="space-y-3">
                <div>
                  <label className="text-sm">{t('yourState')}</label>
                  <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full p-2 border rounded">
                      {Object.keys(ALL_STATES_DATA).map(state => (
                          <option key={state} value={state}>{state}</option>
                      ))}
                  </select>
                </div>
                <div><label className="text-sm">Farmer Type</label><select value={form.farmerType} onChange={e => setForm({ ...form, farmerType: e.target.value })} className="w-full p-2 border rounded"><option>Small</option><option>Marginal</option><option>Large</option></select></div>
                <div><label className="text-sm">Primary Crop</label><input type="text" value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm">Need</label><select value={form.need} onChange={e => setForm({ ...form, need: e.target.value })} className="w-full p-2 border rounded"><option>Crop Insurance</option><option>Loan/Credit</option><option>Equipment Subsidy</option><option>Income Support</option></select></div>
            </div>
            <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                {isAnalyzing ? t('analyzing') : "Find My Schemes"}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {analysis && (
                <div className="relative mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
                     <button onClick={() => speakText(`Top recommendation: ${analysis.recommendedSchemes[0].schemeName}. ${analysis.recommendedSchemes[0].summary}`)} className="absolute top-2 right-2 p-1 hover:bg-green-100 rounded-full"><Volume2 size={16}/></button>
                    {analysis.recommendedSchemes.slice(0, 1).map(scheme => (
                        <p key={scheme.schemeName} className="font-bold">{scheme.schemeName} ({scheme.relevanceScore}% Relevance)</p>
                    ))}
                    <p className="mt-1">See full details in the Govt. Schemes module.</p>
                </div>
            )}
        </SectionCard>
    );
};

// 7. Kisan Khata AI Module
const KisanKhataAIModule = ({ userId, db, speakText }) => {
    const [newBudgetForm, setNewBudgetForm] = useState({ crop: 'Rice', area: 5, region: DEFAULT_LOCATION_NAME });
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [latestBudget, setLatestBudget] = useState(null);
    const { t, language } = useLanguage();


    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, `artifacts/${appId}/users/${userId}/budgets`), orderBy('createdAt', 'desc'), limit(1));
        return onSnapshot(q, snap => {
            const budgetList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setLatestBudget(budgetList.length > 0 ? budgetList[0] : null);
        });
    }, [userId, db]);

    const handleGenerateBudget = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setError('');

        const systemPrompt = `You are 'Agri-Nomics AI', an expert in agricultural finance and crop management in India (knowledge up to Sep 2025). Create a detailed crop budget and profitability projection. Response MUST be in JSON with keys: "itemizedBudget" (array of {category, estimatedCost}), "profitabilityAnalysis" (projectedYield, expectedMarketPrice, totalRevenue, netProfit, returnOnInvestment). Your entire response must be in the language with this code: ${language}.`;
        const userQuery = `Create a detailed budget for a farmer growing ${newBudgetForm.crop} on ${newBudgetForm.area} acres of land in the ${newBudgetForm.region} region of India.`;

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetchWithRetry(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json" } }) });
            if (!response.ok) throw new Error("AI analysis failed.");
            const result = await response.json();
            const aiResponseText = (result.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/\*/g, '');
            if (!aiResponseText) throw new Error("Could not generate a budget.");

            const newBudgetData = JSON.parse(aiResponseText);
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/budgets`), { ...newBudgetForm, ...newBudgetData, actualExpenses: [], createdAt: serverTimestamp() });
            const speechSummary = `Generated a new budget for ${newBudgetForm.crop}. The total estimated cost is ${newBudgetData.itemizedBudget.reduce((sum, item) => sum + item.estimatedCost, 0)} rupees, with a projected net profit of ${newBudgetData.profitabilityAnalysis.netProfit} rupees.`;
            speakText(speechSummary);
        } catch (err) {
            console.error("Budget Generation Error:", err);
            setError("Failed to generate budget. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const totalBudgeted = latestBudget?.itemizedBudget.reduce((sum, item) => sum + item.estimatedCost, 0) || 0;
    const totalSpent = latestBudget?.actualExpenses.reduce((sum, item) => sum + item.amount, 0) || 0;
    const speechTextForLatestBudget = latestBudget ? `Latest budget for ${latestBudget.crop}. Total budgeted: ${totalBudgeted} rupees. Total spent: ${totalSpent} rupees. Projected net profit: ${latestBudget.profitabilityAnalysis.netProfit} rupees.` : "";

    return (
        <SectionCard title={t('cropBudgetAI')} icon={IndianRupee}>
            <form onSubmit={handleGenerateBudget} className="space-y-3">
                <div><label className="text-sm">Crop</label><input type="text" value={newBudgetForm.crop} onChange={e => setNewBudgetForm({ ...newBudgetForm, crop: e.target.value })} required className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm">Area (acres)</label><input type="number" value={newBudgetForm.area} onChange={e => setNewBudgetForm({ ...newBudgetForm, area: parseFloat(e.target.value) })} required className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm">Region</label><input type="text" value={newBudgetForm.region} onChange={e => setNewBudgetForm({ ...newBudgetForm, region: e.target.value })} required className="w-full p-2 border rounded" /></div>
                <button type="submit" disabled={isGenerating} className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                    {isGenerating ? 'Generating...' : 'Generate New Budget'}
                </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {latestBudget && (
                 <div className="relative mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
                     <button onClick={() => speakText(speechTextForLatestBudget)} className="absolute top-2 right-2 p-1 hover:bg-green-100 rounded-full"><Volume2 size={16}/></button>
                    <p className="font-bold">Latest Budget for {latestBudget.crop}</p>
                    <p>Budgeted: ₹{totalBudgeted.toLocaleString('en-IN')}</p>
                    <p>Spent: ₹{totalSpent.toLocaleString('en-IN')}</p>
                    <p>Projected Profit: ₹{latestBudget.profitabilityAnalysis.netProfit.toLocaleString('en-IN')}</p>
                </div>
            )}
        </SectionCard>
    );
};

// 8. Yantra Sahayak AI Module
const YantraSahayakAIModule = ({ userId, db, openMachineryModal, speakText }) => {
    const [myMachinery, setMyMachinery] = useState([]);
    const [selectedMachineId, setSelectedMachineId] = useState('');
    const [aiAdvisorForm, setAiAdvisorForm] = useState({ machineId: '', issue: '' });
    const [aiAnalysisSummary, setAiAnalysisSummary] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();


    useEffect(() => {
        if (!userId || !db) return;
        const qGarage = query(collection(db, `artifacts/${appId}/users/${userId}/machinery`), orderBy('createdAt', 'desc'));
        return onSnapshot(qGarage, snap => {
            const fetchedMachines = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setMyMachinery(fetchedMachines);
            if (!selectedMachineId && fetchedMachines.length > 0) {
                setSelectedMachineId(fetchedMachines[0].id);
            } else if (selectedMachineId && !fetchedMachines.find(m => m.id === selectedMachineId)) {
                setSelectedMachineId(fetchedMachines.length > 0 ? fetchedMachines[0].id : '');
            }
        });
    }, [userId, db, selectedMachineId]);

    const selectedMachine = useMemo(() => myMachinery.find(m => m.id === selectedMachineId), [myMachinery, selectedMachineId]);


    const handleAiAnalysis = async () => {
        if (!selectedMachineId || !aiAdvisorForm.issue) {
            setError(t('selectMachineAndDescribeIssue'));
            return;
        }
        setIsAnalyzing(true);
        setError('');
        setAiAnalysisSummary('');
        const machine = myMachinery.find(m => m.id === selectedMachineId);

        const systemPrompt = `You are 'Yantra AI', an expert agricultural machinery mechanic. Diagnose problems from user's description. Response MUST be in JSON with keys: "potentialCauses" (array of strings), "troubleshootingSteps" (array of strings), and "professionalAdvice" (string). Provide a concise summary of the diagnosis. Your entire response must be in the language with this code: ${language}.`;
        const userQuery = `I have a problem with my ${machine.name} (${machine.type}). The issue is: "${aiAdvisorForm.issue}". Provide a diagnosis.`;

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetchWithRetry(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json" } }) });
            if (!response.ok) throw new Error("AI analysis failed.");
            const result = await response.json();
            const aiResponseText = (result.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/\*/g, '');
            if (!aiResponseText) throw new Error("Could not get an analysis.");
            
            const analysisResult = JSON.parse(aiResponseText);
            const summary = `${t('diagnosisFor')} ${machine.name}: ${analysisResult.potentialCauses.join(', ')}. Try these steps: ${analysisResult.troubleshootingSteps[0]}.`;
            setAiAnalysisSummary(summary);
            speakText(summary);

            await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/machinery`, machine.id), {
                maintenanceLogs: arrayUnion({ type: 'AI Diagnosis', issue: aiAdvisorForm.issue, report: analysisResult, date: new Date().toISOString() })
            });
        } catch (err) {
            console.error("AI Analysis Error:", err);
            setError(`${t('failedToGetAnalysisMachinery')} ${err.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <SectionCard title={t('agriMachineryAI')} icon={Tractor}>
            {myMachinery.length > 0 ? (
                <>
                    <div className="space-y-3">
                        <div><label className="text-sm">{t('selectMachine')}</label><select value={selectedMachineId} onChange={e => setSelectedMachineId(e.target.value)} className="w-full p-2 border rounded"><option value="">{t('selectMachine')}</option>{myMachinery.map(m => <option key={m.id} value={m.id}>{m.name} ({m.type})</option>)}</select></div>
                        <div><label className="block text-sm">{t('describeIssue')}</label><textarea value={aiAdvisorForm.issue} onChange={e => setAiAdvisorForm({ ...aiAdvisorForm, issue: e.target.value })} placeholder="e.g., Engine won't start" rows="3" className="w-full p-2 border rounded"></textarea></div>
                    </div>
                    <button onClick={handleAiAnalysis} disabled={isAnalyzing || !selectedMachineId || !aiAdvisorForm.issue} className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                        {isAnalyzing ? t('analyzing') : t('getDiagnosis')}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    {aiAnalysisSummary && (
                        <div className="relative mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
                            <button onClick={() => speakText(aiAnalysisSummary)} className="absolute top-2 right-2 p-1 hover:bg-green-100 rounded-full"><Volume2 size={16}/></button>
                            {aiAnalysisSummary}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No machinery found.</p>
                    <button onClick={openMachineryModal} className="mt-2 text-sm text-green-600 font-semibold hover:underline">Add Your First Machine</button>
                </div>
            )}
        </SectionCard>
    );
};

// 9. Kisan Mitra AI Module
const KisanMitraAIModule = ({ userId, db, speakText }) => {
    const [queryText, setQueryText] = useState('');
    const [selectedState, setSelectedState] = useState(DEFAULT_STATE_NAME); // For AI context
    const [aiResponse, setAiResponse] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();


    const handleAiQuery = async () => {
        if (!queryText.trim()) return;
        setIsAnalyzing(true);
        setError('');
        setAiResponse(null);

        const systemPrompt = `You are 'Kisan Mitra AI', a helpful assistant for Indian farmers. Identify the correct helpline based on a farmer's query (knowledge current for 2025). Response MUST be JSON with key "helplines" (array of {helplineName, contactNumber, purpose, preparationGuide}). Prioritize national helplines and provide state-specific info for the specified state. Your entire response must be in the language with this code: ${language}.`;
        const userQuery = `A farmer from ${selectedState} has this query: "${queryText}". Which helpline should they contact?`;

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetchWithRetry(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json" } }) });
            if (!response.ok) throw new Error("AI analysis failed.");
            const result = await response.json();
            const aiResponseText = (result.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/\*/g, '');
            if (!aiResponseText) throw new Error("Could not find a helpline.");
            const parsedResponse = JSON.parse(aiResponseText);
            setAiResponse(parsedResponse);
            const speechSummary = `For your query, I recommend contacting ${parsedResponse.helplines[0].helplineName} at ${parsedResponse.helplines[0].contactNumber}.`;
            speakText(speechSummary);
        } catch (err) {
            console.error("AI Query Error:", err);
            setError(`${t('couldNotProcessRequest')} ${err.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <SectionCard title={t('farmerHelplineAI')} icon={Phone}>
                <div className="space-y-3 mb-4">
                    <div>
                        <label className="block text-sm">{t('yourState')}</label>
                        <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="w-full p-2 border rounded">
                            {Object.keys(ALL_STATES_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={queryText} onChange={e => setQueryText(e.target.value)} placeholder={t('loanForTractor')} className="flex-grow p-2 border rounded" />
                        <button onClick={handleAiQuery} disabled={isAnalyzing} className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"><Search size={20} /></button>
                    </div>
                </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {isAnalyzing && <p className="animate-pulse">{t('findingTheRightHelp')}</p>}
            {aiResponse && (
                <div className="relative mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm animate-fade-in">
                    <button onClick={() => speakText(`I recommend contacting ${aiResponse.helplines[0].helplineName} at ${aiResponse.helplines[0].contactNumber}.`)} className="absolute top-2 right-2 p-1 hover:bg-green-100 rounded-full"><Volume2 size={16}/></button>
                    <h4 className="font-bold mb-2">{t('recommendedHelplines')}</h4>
                    {aiResponse.helplines.slice(0, 1).map(h => (
                        <p key={h.contactNumber} className="font-bold">{h.helplineName}: {h.contactNumber}</p>
                    ))}
                    <p className="mt-1">See full details in the Farmer Helpline module.</p>
                </div>
            )}
            <h3 className="text-lg font-bold mt-4">{t('nationalKisanCallCentre')}</h3>
            <p className="text-2xl font-bold text-blue-600">1800-180-1551</p>
        </SectionCard>
    );
};


// --- Main KisanSuvidha AI App ---
const App = () => {
    const [userId, setUserId] = useState('');
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [activeModule, setActiveModule] = useState('dashboard');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatThinking, setIsChatThinking] = useState(false);
    
    const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
    const [isMachineryModalOpen, setIsMachineryModalOpen] = useState(false);
    const [location, setLocation] = useState({ state: DEFAULT_STATE_NAME, city: DEFAULT_LOCATION_NAME });
    
    const { language, setLanguage, t, isLangModalOpen, setIsLangModalOpen } = useLanguage();
    const chatMessagesEndRef = useRef(null);

    const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const audioRef = useRef(null);

// --- Firebase Auth & Chat Listener ---
useEffect(() => {
    if (!auth) return;

    // This sets up the authentication listener.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            // If a user is found (or has just signed in), set their ID.
            setUserId(user.uid);
            setIsAuthReady(true); // <== Confirms that auth is complete.
        } else {
            // If no user is found, attempt to sign them in anonymously.
            try {
                await signInAnonymously(auth);
                // The onAuthStateChanged listener will run again with the new user.
            } catch (e) {
                console.error("Anonymous sign-in failed:", e);
                setIsAuthReady(true); // <== Set ready even on failure to avoid getting stuck.
            }
        }
    });

    // Cleanup the listener when the component unmounts.
    return () => unsubscribe();
}, []);

useEffect(() => {
    // This effect now waits for auth to be ready AND for a userId to exist.
    if (!isAuthReady || !userId || !db) return; // <== Change: Added isAuthReady check.

    // Creates a query to get chat messages, ordered by time.
    const q = query(collection(db, `artifacts/${appId}/users/${userId}/chatHistory`), orderBy('timestamp'));
    
    // Sets up the real-time listener.
    const unsubscribe = onSnapshot(q, 
        (snap) => {
            setChatMessages(snap.docs.map(d => d.data()));
        },
        (error) => {
            // This will log permission errors if they still occur.
            console.error("Firestore snapshot listener error:", error);
        }
    );

    // Cleanup the listener when the component unmounts.
    return () => unsubscribe(); 
    
}, [userId, db, isAuthReady]); // <== Change: Added isAuthReady to the dependency array.

useEffect(() => { 
    // This hook is for UI and does not need changes.
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
}, [chatMessages]);

const stopSpeech = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
    }
};
    // --- TTS Function ---
    const speakText = useCallback(async (text) => {
        if (!isSpeechEnabled) return;
        
        stopSpeech();

        const langConfig = Object.values(LANGUAGES).find(l => l.code === language);
        if(!langConfig) {
            console.error("Language config for TTS not found:", language);
            return;
        }
        const payload = { model: "gemini-2.5-flash-preview-tts", contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: langConfig.voice } } } } };
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetchWithRetry(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;

            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)[1], 10);
                const pcmData = base64ToArrayBuffer(audioData);
                const wavBlob = pcmToWav(new Int16Array(pcmData), sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);
                const newAudio = new Audio(audioUrl);
                audioRef.current = newAudio;
                newAudio.play();
            } else { console.error("No audio data received.", result); }
        } catch (err) { console.error("TTS Error:", err); }
    }, [language, isSpeechEnabled]);

    const toggleSpeech = () => {
        if (isSpeechEnabled) {
            stopSpeech();
        }
        setIsSpeechEnabled(!isSpeechEnabled);
    };


    // --- Speech Recognition ---
    const handleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.interimResults = false;
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setChatInput(transcript);
        };

        recognition.start();
    };

    const handleChatSend = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !userId) return;

        const userMsg = { text: chatInput, sender: 'user', timestamp: serverTimestamp() };
        setChatInput('');
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chatHistory`), userMsg);
        setIsChatThinking(true);

        const chatHistoryContext = chatMessages.map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');
        const systemPrompt = `You are 'KisanSahayak', an AI assistant for Indian farmers. You have access to modules for weather, soil health, crop health AI, crop advisor AI, agri-market AI, government schemes, crop budget, agri-machinery, and farmer helpline. Your knowledge is current up to 2025. Understand the user's intent and provide helpful, concise advice. Mention which module might be most relevant if the query requires detailed analysis. Respond in the language requested by the user, which is identified by its code: ${language}. Do not use markdown like asterisks.`;
        const userQuery = `Context: The user has selected ${language} as their language. Their query is: "${chatInput}".`;
        const fullPrompt = `${systemPrompt}\n\nChat History:\n${chatHistoryContext}\n\n${userQuery}\n\nAI:`;

// REPLACE the existing try...catch block with this one
try {
    const apiUrl = `/.netlify/functions/chat`;

    const response = await fetch(apiUrl, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ fullPrompt: fullPrompt }) 
    });

    if (!response.ok) {
        throw new Error("The chat function failed.");
    }

    const result = await response.json();
    const aiText = result.text || t('havingTroubleConnecting');

    await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chatHistory`), { text: aiText, sender: 'ai', timestamp: serverTimestamp() });
    speakText(aiText);

} catch (err) {
    console.error("Chat AI Error:", err);
    await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chatHistory`), { text: t('havingTroubleConnecting'), sender: 'ai', timestamp: serverTimestamp() });
} finally { 
    setIsChatThinking(false); 
}
    };

    const renderModule = () => {
        if (!isAuthReady) return <div className="text-center p-8">Loading user authentication...</div>;
        if (!userId) return <div className="text-center p-8">Please sign in to use the app.</div>;

        switch (activeModule) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">{t('welcomeMessage')}</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             <WeatherModule apiKey={OPENWEATHER_API_KEY} location={location} setLocation={setLocation} />
                             <SoilHealthModule userId={userId} db={db} appId={appId} openPlotModal={() => setIsPlotModalOpen(true)} />
                             <CropHealthAIModule userId={userId} db={db} storage={storage} appId={appId} openPlotModal={() => setIsPlotModalOpen(true)} isAuthReady={isAuthReady} speakText={speakText}/>
                             <CropAdvisorAIModule userId={userId} db={db} speakText={speakText} />
                             <AgriMarketAIModule userId={userId} db={db} location={location} speakText={speakText}/>
                             <GramSevaAIModule userId={userId} db={db} speakText={speakText} />
                             <KisanKhataAIModule userId={userId} db={db} speakText={speakText}/>
                             <YantraSahayakAIModule userId={userId} db={db} openMachineryModal={() => setIsMachineryModalOpen(true)} speakText={speakText}/>
                             <KisanMitraAIModule userId={userId} db={db} speakText={speakText}/>
                        </div>
                    </div>
                );
            case 'weather': return <WeatherModule apiKey={OPENWEATHER_API_KEY} location={location} setLocation={setLocation} />;
            case 'soilHealth': return <SoilHealthModule userId={userId} db={db} appId={appId} openPlotModal={() => setIsPlotModalOpen(true)} />;
            case 'cropHealthAI': return <CropHealthAIModule userId={userId} db={db} storage={storage} appId={appId} openPlotModal={() => setIsPlotModalOpen(true)} isAuthReady={isAuthReady} speakText={speakText}/>;
            case 'cropAdvisorAI': return <CropAdvisorAIModule userId={userId} db={db} speakText={speakText}/>;
            case 'agriMarketAI': return <AgriMarketAIModule userId={userId} db={db} location={location} speakText={speakText}/>;
            case 'gramSevaAI': return <GramSevaAIModule userId={userId} db={db} speakText={speakText}/>;
            case 'kisanKhataAI': return <KisanKhataAIModule userId={userId} db={db} speakText={speakText}/>;
            case 'yantraSahayakAI': return <YantraSahayakAIModule userId={userId} db={db} openMachineryModal={() => setIsMachineryModalOpen(true)} speakText={speakText}/>;
            case 'kisanMitraAI': return <KisanMitraAIModule userId={userId} db={db} speakText={speakText}/>;
            default: return <div className="text-center p-8">Select a module from the sidebar.</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 font-sans flex">
            {/* Language Selection Modal */}
            <CustomModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} title={t('selectLanguage')}>
                 <div className="grid grid-cols-2 gap-4 mt-4">
                     {Object.entries(LANGUAGES).map(([name, { code }]) => (
                         <button key={code} onClick={() => setLanguage(code)} className="p-4 bg-green-100 text-green-800 font-semibold rounded-lg hover:bg-green-200 transition">
                             {name}
                         </button>
                     ))}
                 </div>
            </CustomModal>
            
            {/* Other Modals */}
            <AddPlotModal isOpen={isPlotModalOpen} onClose={() => setIsPlotModalOpen(false)} userId={userId} db={db} t={t} />
            <AddMachineryModal isOpen={isMachineryModalOpen} onClose={() => setIsMachineryModalOpen(false)} userId={userId} db={db} t={t} />

            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white shadow-lg p-4 flex flex-col items-center border-r border-gray-200">
                <h1 className="text-3xl font-bold text-green-700 mb-6 flex items-center gap-2"><Zap size={28} /> AgriPulse 360</h1>
                <nav className="flex flex-col w-full space-y-2">
                    <SidebarButton icon={Layers} label={t('dashboard')} onClick={() => setActiveModule('dashboard')} active={activeModule === 'dashboard'} />
                    <SidebarButton icon={Cloud} label={t('weather')} onClick={() => setActiveModule('weather')} active={activeModule === 'weather'} />
                    <SidebarButton icon={Droplets} label={t('soilHealth')} onClick={() => setActiveModule('soilHealth')} active={activeModule === 'soilHealth'} />
                    <SidebarButton icon={Leaf} label={t('cropHealthAI')} onClick={() => setActiveModule('cropHealthAI')} active={activeModule === 'cropHealthAI'} />
                    <SidebarButton icon={Lightbulb} label={t('cropAdvisorAI')} onClick={() => setActiveModule('cropAdvisorAI')} active={activeModule === 'cropAdvisorAI'} />
                    <SidebarButton icon={IndianRupee} label={t('agriMarketAI')} onClick={() => setActiveModule('agriMarketAI')} active={activeModule === 'agriMarketAI'} />
                    <SidebarButton icon={Shield} label={t('govtSchemesAI')} onClick={() => setActiveModule('gramSevaAI')} active={activeModule === 'gramSevaAI'} />
                    <SidebarButton icon={Wallet} label={t('cropBudgetAI')} onClick={() => setActiveModule('kisanKhataAI')} active={activeModule === 'kisanKhataAI'} />
                    <SidebarButton icon={Tractor} label={t('agriMachineryAI')} onClick={() => setActiveModule('yantraSahayakAI')} active={activeModule === 'yantraSahayakAI'} />
                    <SidebarButton icon={Phone} label={t('farmerHelplineAI')} onClick={() => setActiveModule('kisanMitraAI')} active={activeModule === 'kisanMitraAI'} />
                </nav>
                <div className="mt-auto w-full">
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-4 border-t pt-4">
                         <div className="flex items-center">
                            <Globe size={16} className="mr-2"/>
                            <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-transparent">
                                {Object.entries(LANGUAGES).map(([name, { code }]) => <option key={code} value={code}>{name}</option>)}
                            </select>
                         </div>
                         <button onClick={toggleSpeech} title={isSpeechEnabled ? "Disable Speech" : "Enable Speech"}>
                            {isSpeechEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="text-red-500"/>}
                         </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow p-6 bg-gray-50 overflow-y-auto">
                {renderModule()}
            </main>

            {/* Floating Chat Button */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition"
                title="Open KisanSahayak Chat"
            >
                {isChatOpen ? <MessageSquare size={24} /> : <Bot size={24} />}
            </button>

            {/* Chatbot Window */}
            {isChatOpen && (
                <div className="fixed bottom-20 right-6 w-80 h-[600px] bg-white rounded-2xl shadow-xl flex flex-col z-40 border border-gray-200">
                    <div className="bg-green-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
                        <h3 className="font-bold text-lg">KisanSahayak AI</h3>
                        <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-gray-200"><X size={20}/></button>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto space-y-3 custom-scrollbar">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-2 rounded-lg text-sm ${
                                  msg.sender === 'user' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatMessagesEndRef} />
                        {isChatThinking && (
                                <div className="flex justify-start">
                                    <div className="max-w-[75%] p-2 rounded-lg text-sm bg-gray-100 text-gray-800 animate-pulse">
                                        {t('aiThinking')}
                                    </div>
                                </div>
                        )}
                    </div>
                    <form onSubmit={handleChatSend} className="p-4 border-t border-gray-200 flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={t('askKisanSahayak')}
                            className="flex-grow p-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-green-500"
                            disabled={isChatThinking}
                        />
                         <button 
                            type="button" 
                            onClick={handleVoiceInput}
                            className={`p-2 rounded-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            disabled={isChatThinking}
                         >
                            <Mic size={20}/>
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            disabled={isChatThinking}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}

               <style>{`
                 body { font-family: 'Inter', sans-serif; }
                 .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                 .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px;}
                 .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 3px;}
                 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
                 .animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
               `}</style>
        </div>
    );
};

const SidebarButton = ({ icon: Icon, label, onClick, active }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
            active ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
        <Icon size={20} className={active ? 'text-green-600' : 'text-gray-500'} />
        <span className="text-sm">{label}</span>
    </button>
);

const RootApp = () => (
    <LanguageProvider>
        <App />
    </LanguageProvider>
);

export default RootApp;
