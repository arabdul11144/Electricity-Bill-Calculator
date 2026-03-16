(function (window, document) {
    'use strict';

    const STORAGE_KEYS = {
        consumption: 'consumption',
        previousMeter: 'previousMeter',
        customerCategory: 'customerCategory'
    };

    const DEFAULT_CATEGORY = 'domestic';
    const HIGH_CONSUMPTION_WARNING_THRESHOLD = 100;
    const MAX_METER_READING = 1000000;
    const MAX_CONSUMPTION = 100000;

    const CATEGORY_ORDER = ['domestic', 'religious', 'industries', 'business', 'hotel', 'government'];
    const CATEGORY_ALIASES = {
        domestic: 'domestic',
        religious: 'religious',
        industrial: 'industries',
        industries: 'industries',
        business: 'business',
        hotel: 'hotel',
        government: 'government',
        governmentinstitution: 'government',
        governmentinstitutions: 'government',
        'government-institution': 'government',
        'government-institutions': 'government'
    };

    const TARIFF_DATA = {
        versionKey: 'appCurrentTariffTableSet',
        categories: {
            domestic: {
                tableClass: 'domestic-tb',
                captionClass: 'domestic-cap',
                rows: [
                    { labelStart: 0, maxUnits: 30, unitRate: 8, fixedCharge: 150 },
                    { labelStart: 31, maxUnits: 60, unitRate: 20, fixedCharge: 300 },
                    { type: 'subheader', translationKey: 'unitsOver60' },
                    { labelStart: 61, maxUnits: 90, unitRate: 30, fixedCharge: 400 },
                    { labelStart: 91, maxUnits: 120, unitRate: 50, fixedCharge: 1000 },
                    { labelStart: 121, maxUnits: 180, unitRate: 50, fixedCharge: 1500 },
                    { maxUnits: null, unitRate: 75, fixedCharge: 2000, labelAbove: 180 }
                ]
            },
            religious: {
                tableClass: 'religious-tb',
                captionClass: 'religious-cap',
                rows: [
                    { labelStart: 0, maxUnits: 30, unitRate: 6, fixedCharge: 100 },
                    { labelStart: 31, maxUnits: 90, unitRate: 6, fixedCharge: 250 },
                    { labelStart: 91, maxUnits: 120, unitRate: 10, fixedCharge: 300 },
                    { labelStart: 121, maxUnits: 180, unitRate: 20, fixedCharge: 1200 },
                    { maxUnits: null, unitRate: 30, fixedCharge: 1600, labelAbove: 180 }
                ]
            },
            industries: {
                tableClass: 'industries-tb',
                captionClass: 'industries-cap',
                rows: [
                    { labelStart: 0, maxUnits: 300, unitRate: 10, fixedCharge: 300 },
                    { maxUnits: null, unitRate: 16, fixedCharge: 1000, labelAbove: 301 }
                ]
            },
            business: {
                tableClass: 'business-tb',
                captionClass: 'business-cap',
                rows: [
                    { labelStart: 0, maxUnits: 180, unitRate: 26.4, fixedCharge: 600 },
                    { maxUnits: null, unitRate: 34.4, fixedCharge: 1500, labelAbove: 181 }
                ]
            },
            hotel: {
                tableClass: 'hotel-tb',
                captionClass: 'hotel-cap',
                rows: [
                    { labelStart: 0, maxUnits: 180, unitRate: 10, fixedCharge: 300 },
                    { maxUnits: null, unitRate: 16, fixedCharge: 1000, labelAbove: 181 }
                ]
            },
            government: {
                tableClass: 'government-tb',
                captionClass: 'government-cap',
                rows: [
                    { labelStart: 0, maxUnits: 180, unitRate: 26.4, fixedCharge: 600 },
                    { maxUnits: null, unitRate: 34.4, fixedCharge: 1500, labelAbove: 181 }
                ]
            }
        }
    };

    const TRANSLATIONS = {
        en: {
            calculator: {
                title: 'Electricity Consumption Calculator',
                previousLabel: 'Previous Meter Reader (kWh):',
                previousPlaceholder: 'Enter previous meter reading',
                currentLabel: 'Current Meter Reader (kWh):',
                currentPlaceholder: 'Enter current meter reading',
                calculateButton: 'Calculate Consumption',
                consumptionLabel: 'Consumption:',
                calculateBillButton: 'Calculate the Bill',
                backButton: 'Back to Home Page'
            },
            validation: {
                emptyFields: 'Please enter both meter readings.',
                invalidNumbers: 'Please enter valid numeric meter readings.',
                negativeReadings: 'Meter readings cannot be negative.',
                currentLessThanPrevious: 'Current meter reading cannot be lower than the previous meter reading.',
                readingTooLarge: 'Meter readings are too large. Please check the values and try again.',
                consumptionTooLarge: 'Calculated consumption is too large. Please check both readings.',
                highConsumption: 'Warning: Your electricity consumption is high.'
            },
            bill: {
                title: 'Electricity Bill Calculator',
                consumptionDetails: 'Consumption: {units} kWh',
                fixedCharge: 'Fixed Charge: LKR {amount}',
                totalBill: 'Total Bill: LKR {total}',
                backButton: 'Back to Home Page',
                tipsButton: 'How To Reduce the Electricity Consumption',
                noConsumption: 'Please calculate consumption first.',
                tariffVersion: 'Tariff profile used: {version} ({category})'
            },
            details: {
                homeButton: 'Back to Home',
                title: 'Unit Calculation Details',
                units: 'Units',
                unitPrice: 'Unit Price',
                fixedAmount: 'Fixed Amount',
                unitsOver60: 'Units Over 60',
                captions: {
                    domestic: '30 Days (Domestic)',
                    religious: '30 Days (Religious Places)',
                    industries: '30 Days (Industries)',
                    business: '30 Days (Business)',
                    hotel: '30 Days (Hotel)',
                    government: '30 Days (Government Institutions)'
                },
                tariffVersionNote: 'Calculator tariff profile: {version}'
            },
            common: {
                versionName: 'Current app tariff table set',
                aboveLabel: 'Above {value}',
                categories: {
                    domestic: 'Domestic',
                    religious: 'Religious Places',
                    industries: 'Industries',
                    business: 'Business',
                    hotel: 'Hotel',
                    government: 'Government Institutions'
                }
            }
        },
        si: {
            calculator: {
                title: 'විදුලි පරිභෝජන කැල්ක්යුලේටරය',
                previousLabel: 'පෙර මනු කියවන්නා  (kWh):',
                previousPlaceholder: 'පෙර මීටර කියවීම ඇතුළත් කරන්න',
                currentLabel: 'වත්මන් මනු කියවන්නා  (kWh):',
                currentPlaceholder: 'වත්මන් මීටර කියවීම ඇතුළත් කරන්න',
                calculateButton: 'පරිභෝජනය ගණනය කරන්න',
                consumptionLabel: 'පරිභෝජනය:',
                calculateBillButton: 'බිල්පත ගණනය කරන්න',
                backButton: 'මුල් පිටුවට ආපසු යන්න'
            },
            validation: {
                emptyFields: 'කරුණාකර මීටර් කියවීම් දෙකම ඇතුළත් කරන්න.',
                invalidNumbers: 'කරුණාකර වලංගු මීටර කියවීම් ඇතුළත් කරන්න.',
                negativeReadings: 'මීටර් කියවීම් ඍණ අගයන් විය නොහැක.',
                currentLessThanPrevious: 'වත්මන් මීටර් කියවීම පෙර මීටර් කියවීමට වඩා අඩු විය නොහැක.',
                readingTooLarge: 'මීටර් කියවීම් අසාමාන්‍ය ලෙස විශාලය. කරුණාකර අගයන් නැවත පරීක්ෂා කරන්න.',
                consumptionTooLarge: 'ගණනය කළ පරිභෝජනය අසාමාන්‍ය ලෙස විශාලය. කරුණාකර කියවීම් දෙකම පරීක්ෂා කරන්න.',
                highConsumption: 'අවවාදයයි: ඔබේ විදුලි පරිභෝජනය ඉහළයි.'
            },
            bill: {
                title: 'විදුලි බිල්පත් කැල්ක්යුලේටරය',
                consumptionDetails: 'පරිභෝජනය: {units} kWh',
                fixedCharge: 'ස්ථාවර ගාස්තුව: LKR {amount}',
                totalBill: 'මුළු බිල්පත: LKR {total}',
                backButton: 'මුල් පිටුවට ආපසු යන්න',
                tipsButton: 'විදුලි පරිභෝජනය අඩු කරන්නේ කෙසේද?',
                noConsumption: 'කරුණාකර පළමුව පරිභෝජනය ගණනය කරන්න.',
                tariffVersion: 'භාවිතා කළ ගාස්තු පැතිකඩ: {version} ({category})'
            },
            details: {
                homeButton: 'ආපසු නිවසට',
                title: 'ඒකක ගණනය කිරීමේ විස්තර',
                units: 'ඒකක',
                unitPrice: 'ඒකක මිල',
                fixedAmount: 'ස්ථාවර මුදල',
                unitsOver60: 'ඒකක 60 ට වැඩි',
                captions: {
                    domestic: 'දින 30 (ගෘහස්ථ)',
                    religious: 'දින 30 (ආගමික ස්ථාන)',
                    industries: 'දින 30 (කර්මාන්ත)',
                    business: 'දින 30 (ව්‍යාපාර)',
                    hotel: 'දින 30 (හෝටල්)',
                    government: 'දින 30 (රාජ්‍ය ආයතන)'
                },
                tariffVersionNote: 'ගණනය සඳහා භාවිතා වන ගාස්තු පැතිකඩ: {version}'
            },
            common: {
                versionName: 'යෙදුමේ වත්මන් ගාස්තු වගුව',
                aboveLabel: 'උඩින් {value}',
                categories: {
                    domestic: 'ගෘහස්ථ',
                    religious: 'ආගමික ස්ථාන',
                    industries: 'කර්මාන්ත',
                    business: 'ව්‍යාපාර',
                    hotel: 'හෝටල්',
                    government: 'රාජ්‍ය ආයතන'
                }
            }
        },
        ta: {
            calculator: {
                title: 'மின் நுகர்வு கணிப்பான்',
                previousLabel: 'முந்தைய மீட்டர் வாசிப்பு (kWh):',
                previousPlaceholder: 'முந்தைய மீட்டர் வாசிப்பினை உள்ளிடவும்',
                currentLabel: 'தற்போதைய மீட்டர் வாசிப்பு (kWh):',
                currentPlaceholder: 'தற்போதைய மீட்டர் வாசிப்பினை உள்ளிடவும்',
                calculateButton: 'நுகர்வினை கணக்கிடுங்கள்',
                consumptionLabel: 'நுகர்வு:',
                calculateBillButton: 'சிட்டையை கணக்கிடுங்கள்',
                backButton: 'பிரதான பக்கத்திற்கு செல்ல'
            },
            validation: {
                emptyFields: 'இரண்டு மீட்டர் வாசிப்புகளையும் உள்ளிடவும்.',
                invalidNumbers: 'சரியான மீட்டர் அளவீடுகளை உள்ளிடவும்.',
                negativeReadings: 'மீட்டர் வாசிப்புகள் எதிர்மறை மதிப்பாக இருக்க முடியாது.',
                currentLessThanPrevious: 'தற்போதைய மீட்டர் வாசிப்பு முந்தைய மீட்டர் வாசிப்பை விட குறைவாக இருக்க முடியாது.',
                readingTooLarge: 'மீட்டர் வாசிப்புகள் இயல்புக்கு மீறி பெரியதாக உள்ளன. மதிப்புகளைச் சரிபார்க்கவும்.',
                consumptionTooLarge: 'கணக்கிடப்பட்ட நுகர்வு இயல்புக்கு மீறி பெரியதாக உள்ளது. இரண்டு வாசிப்புகளையும் சரிபார்க்கவும்.',
                highConsumption: 'எச்சரிக்கை: உங்கள் மின் நுகர்வு அதிகமாக உள்ளது.'
            },
            bill: {
                title: 'மின்சார பில் கால்குலேட்டர்',
                consumptionDetails: 'நுகர்வு: {units} kWh',
                fixedCharge: 'நிலையான கட்டணம்: LKR {amount}',
                totalBill: 'மொத்த பில்: LKR {total}',
                backButton: 'முகப்புப் பக்கத்துக்குத் திரும்பு',
                tipsButton: 'மின்சார நுகர்வு குறைப்பது எப்படி',
                noConsumption: 'முதலில் நுகர்வை கணக்கிடவும்.',
                tariffVersion: 'பயன்படுத்திய கட்டண வடிவம்: {version} ({category})'
            },
            details: {
                homeButton: 'முகப்புக்குத் திரும்பு',
                title: 'அலகு கணக்கீடு விவரங்கள்',
                units: 'அலகுகள்',
                unitPrice: 'அலகு விலை',
                fixedAmount: 'நிலையான தொகை',
                unitsOver60: 'அலகுகள் 60 க்கு மேல்',
                captions: {
                    domestic: '30 நாட்கள் (உள்நாட்டு)',
                    religious: '30 நாட்கள் (மத இடங்கள்)',
                    industries: '30 நாட்கள் (தொழில்துறை)',
                    business: '30 நாட்கள் (வணிகம்)',
                    hotel: '30 நாட்கள் (ஹோட்டல்)',
                    government: '30 நாட்கள் (அரசு நிறுவனங்கள்)'
                },
                tariffVersionNote: 'கணக்கீட்டில் பயன்படுத்தப்படும் கட்டண வடிவம்: {version}'
            },
            common: {
                versionName: 'பயன்பாட்டின் தற்போதைய கட்டண அட்டவணை',
                aboveLabel: '{value} க்கு மேல்',
                categories: {
                    domestic: 'உள்நாட்டு',
                    religious: 'மத இடங்கள்',
                    industries: 'தொழில்துறை',
                    business: 'வணிகம்',
                    hotel: 'ஹோட்டல்',
                    government: 'அரசு நிறுவனங்கள்'
                }
            }
        }
    };

    function getMessages(language) {
        return TRANSLATIONS[language] || TRANSLATIONS.en;
    }

    function formatTemplate(template, values) {
        return template.replace(/\{(\w+)\}/g, function (_, key) {
            return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : '';
        });
    }

    function setText(id, text) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = text;
        }
    }

    function setPlaceholder(id, text) {
        const element = document.getElementById(id);

        if (element) {
            element.setAttribute('placeholder', text);
        }
    }

    function getStorageItem(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function setStorageItem(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            // Ignore storage errors and keep current flow working.
        }
    }

    function normalizeCategory(category) {
        if (!category) {
            return DEFAULT_CATEGORY;
        }

        const normalizedValue = String(category)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/_/g, '-');

        return CATEGORY_ALIASES[normalizedValue] || DEFAULT_CATEGORY;
    }

    function getQueryCategory() {
        try {
            const params = new URLSearchParams(window.location.search);
            const rawCategory = params.get('category');

            return rawCategory ? normalizeCategory(rawCategory) : null;
        } catch (error) {
            return null;
        }
    }

    function resolveCategory() {
        const queryCategory = getQueryCategory();

        if (queryCategory) {
            setStorageItem(STORAGE_KEYS.customerCategory, queryCategory);
            return queryCategory;
        }

        const storedCategory = normalizeCategory(getStorageItem(STORAGE_KEYS.customerCategory));
        setStorageItem(STORAGE_KEYS.customerCategory, storedCategory);
        return storedCategory;
    }

    function formatRate(rate) {
        return Number(rate).toFixed(1);
    }

    function formatMoney(value) {
        return Number(value).toFixed(2);
    }

    function formatTableRate(rate) {
        return Number.isInteger(rate) ? String(rate) : String(rate);
    }

    function getCategoryName(messages, category) {
        return messages.common.categories[category] || messages.common.categories[DEFAULT_CATEGORY];
    }

    function getVersionLabel(messages) {
        return messages.common.versionName;
    }

    function getActiveRows(category) {
        return TARIFF_DATA.categories[category].rows.filter(function (row) {
            return row.type !== 'subheader';
        });
    }

    function buildStepLine(labelStart, labelEnd, unitsInRange, rate) {
        return labelStart + ' - ' + labelEnd + ' kWh: ' + unitsInRange + ' * ' + formatRate(rate) + ' = LKR ' + formatMoney(unitsInRange * rate);
    }

    function calculateDomesticBill(units) {
        const steps = [];
        let energyCharge = 0;
        let fixedCharge = 150;

        if (units <= 30) {
            energyCharge = units * 8;
            fixedCharge = 150;
            steps.push(buildStepLine(0, units, units, 8));
        } else if (units <= 60) {
            energyCharge = (30 * 8) + ((units - 30) * 20);
            fixedCharge = 300;
            steps.push(buildStepLine(0, 30, 30, 8));
            steps.push(buildStepLine(31, units, units - 30, 20));
        } else if (units <= 90) {
            energyCharge = (60 * 25) + ((units - 60) * 30);
            fixedCharge = 400;
            steps.push(buildStepLine(0, 60, 60, 25));
            steps.push(buildStepLine(61, units, units - 60, 30));
        } else if (units <= 120) {
            energyCharge = (60 * 25) + (30 * 30) + ((units - 90) * 50);
            fixedCharge = 1000;
            steps.push(buildStepLine(0, 60, 60, 25));
            steps.push(buildStepLine(61, 90, 30, 30));
            steps.push(buildStepLine(91, units, units - 90, 50));
        } else if (units <= 180) {
            energyCharge = (60 * 25) + (30 * 30) + (30 * 50) + ((units - 120) * 50);
            fixedCharge = 1500;
            steps.push(buildStepLine(0, 60, 60, 25));
            steps.push(buildStepLine(61, 90, 30, 30));
            steps.push(buildStepLine(91, 120, 30, 50));
            steps.push(buildStepLine(121, units, units - 120, 50));
        } else {
            energyCharge = (60 * 25) + (30 * 30) + (60 * 50) + ((units - 180) * 75);
            fixedCharge = 2000;
            steps.push(buildStepLine(0, 60, 60, 25));
            steps.push(buildStepLine(61, 90, 30, 30));
            steps.push(buildStepLine(91, 120, 30, 50));
            steps.push(buildStepLine(121, 180, 60, 50));
            steps.push(buildStepLine(181, units, units - 180, 75));
        }

        return {
            category: DEFAULT_CATEGORY,
            units: units,
            energyCharge: energyCharge,
            fixedCharge: fixedCharge,
            total: energyCharge + fixedCharge,
            steps: steps
        };
    }

    function calculateProgressiveBill(category, units) {
        const rows = getActiveRows(category);
        const steps = [];
        let previousMax = 0;
        let energyCharge = 0;
        let fixedCharge = rows[0].fixedCharge;

        for (let index = 0; index < rows.length; index += 1) {
            const row = rows[index];
            const currentMax = row.maxUnits === null ? units : Math.min(units, row.maxUnits);

            if (units > previousMax) {
                const unitsInRange = currentMax - previousMax;

                if (unitsInRange > 0) {
                    const labelStart = previousMax === 0 ? 0 : previousMax + 1;
                    steps.push(buildStepLine(labelStart, currentMax, unitsInRange, row.unitRate));
                    energyCharge += unitsInRange * row.unitRate;
                }
            }

            if (row.maxUnits === null || units <= row.maxUnits) {
                fixedCharge = row.fixedCharge;
                break;
            }

            previousMax = row.maxUnits;
        }

        return {
            category: category,
            units: units,
            energyCharge: energyCharge,
            fixedCharge: fixedCharge,
            total: energyCharge + fixedCharge,
            steps: steps
        };
    }

    function calculateReligiousBill(units) {
        return calculateProgressiveBill('religious', units);
    }

    function calculateIndustriesBill(units) {
        return calculateProgressiveBill('industries', units);
    }

    function calculateBusinessBill(units) {
        return calculateProgressiveBill('business', units);
    }

    function calculateHotelBill(units) {
        return calculateProgressiveBill('hotel', units);
    }

    function calculateGovernmentBill(units) {
        return calculateProgressiveBill('government', units);
    }

    function calculateBillByCategory(category, units) {
        const normalizedCategory = normalizeCategory(category);
        const numericUnits = Number(units);

        if (!Number.isFinite(numericUnits) || numericUnits < 0) {
            return null;
        }

        switch (normalizedCategory) {
            case 'religious':
                return calculateReligiousBill(numericUnits);
            case 'industries':
                return calculateIndustriesBill(numericUnits);
            case 'business':
                return calculateBusinessBill(numericUnits);
            case 'hotel':
                return calculateHotelBill(numericUnits);
            case 'government':
                return calculateGovernmentBill(numericUnits);
            case 'domestic':
            default:
                return calculateDomesticBill(numericUnits);
        }
    }

    function validateReadings(previousValue, currentValue, messages) {
        if (previousValue === '' || currentValue === '') {
            return { error: messages.validation.emptyFields };
        }

        const previous = Number(previousValue);
        const current = Number(currentValue);

        if (!Number.isFinite(previous) || !Number.isFinite(current)) {
            return { error: messages.validation.invalidNumbers };
        }

        if (previous < 0 || current < 0) {
            return { error: messages.validation.negativeReadings };
        }

        if (previous > MAX_METER_READING || current > MAX_METER_READING) {
            return { error: messages.validation.readingTooLarge };
        }

        if (current < previous) {
            return { error: messages.validation.currentLessThanPrevious };
        }

        const consumption = current - previous;

        if (consumption > MAX_CONSUMPTION) {
            return { error: messages.validation.consumptionTooLarge };
        }

        return {
            previous: previous,
            current: current,
            consumption: consumption,
            warning: consumption > HIGH_CONSUMPTION_WARNING_THRESHOLD ? messages.validation.highConsumption : ''
        };
    }

    function applyCalculatorTranslations(messages) {
        setText('calculatorTitle', messages.calculator.title);
        setText('previousMeterLabel', messages.calculator.previousLabel);
        setPlaceholder('previousMeter', messages.calculator.previousPlaceholder);
        setText('currentMeterLabel', messages.calculator.currentLabel);
        setPlaceholder('currentMeter', messages.calculator.currentPlaceholder);
        setText('calculateConsumptionBtn', messages.calculator.calculateButton);
        setText('consumptionLabel', messages.calculator.consumptionLabel);
        setText('calculateBillBtn', messages.calculator.calculateBillButton);
        setText('backBtn', messages.calculator.backButton);
    }

    function applyBillTranslations(messages) {
        setText('billTitle', messages.bill.title);
        setText('backBtn', messages.bill.backButton);
        setText('backBtn1', messages.bill.tipsButton);
    }

    function applyDetailsTranslations(messages) {
        setText('detailsTitle', messages.details.title);
        setText('detailsHomeButtonText', messages.details.homeButton);
    }

    function createTableCell(tagName, textContent) {
        const cell = document.createElement(tagName);
        cell.textContent = textContent;
        return cell;
    }

    function getDisplayLabel(row, messages) {
        if (row.maxUnits === null) {
            return formatTemplate(messages.common.aboveLabel, { value: row.labelAbove });
        }

        return row.labelStart + '-' + row.maxUnits;
    }

    function renderTariffTables(language) {
        const messages = getMessages(language);
        const container = document.getElementById('tariffTables');

        if (!container) {
            return;
        }

        container.innerHTML = '';

        CATEGORY_ORDER.forEach(function (category) {
            const categoryConfig = TARIFF_DATA.categories[category];
            const table = document.createElement('table');
            const caption = document.createElement('caption');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const tbody = document.createElement('tbody');

            table.className = categoryConfig.tableClass;
            caption.className = categoryConfig.captionClass;
            caption.textContent = messages.details.captions[category];

            headerRow.appendChild(createTableCell('th', messages.details.units));
            headerRow.appendChild(createTableCell('th', messages.details.unitPrice));
            headerRow.appendChild(createTableCell('th', messages.details.fixedAmount));
            thead.appendChild(headerRow);

            categoryConfig.rows.forEach(function (row) {
                const tableRow = document.createElement('tr');

                if (row.type === 'subheader') {
                    const subheaderCell = document.createElement('td');
                    subheaderCell.colSpan = 3;
                    subheaderCell.className = 'subheader';
                    subheaderCell.textContent = messages.details[row.translationKey];
                    tableRow.appendChild(subheaderCell);
                } else {
                    tableRow.appendChild(createTableCell('td', getDisplayLabel(row, messages)));
                    tableRow.appendChild(createTableCell('td', formatTableRate(row.unitRate)));
                    tableRow.appendChild(createTableCell('td', String(row.fixedCharge)));
                }

                tbody.appendChild(tableRow);
            });

            table.appendChild(caption);
            table.appendChild(thead);
            table.appendChild(tbody);
            container.appendChild(table);
        });
    }

    function initCalculatorPage(config) {
        const language = config.language || 'en';
        const messages = getMessages(language);
        const previousMeterInput = document.getElementById('previousMeter');
        const currentMeterInput = document.getElementById('currentMeter');
        const errorMessage = document.getElementById('errorMessage');
        const consumptionElement = document.getElementById('consumption');
        const calculateBillButton = document.getElementById('calculateBillBtn');

        document.documentElement.lang = language;
        applyCalculatorTranslations(messages);
        resolveCategory();

        if (previousMeterInput) {
            previousMeterInput.value = getStorageItem(STORAGE_KEYS.previousMeter) || '';
        }

        window.calculateConsumption = function () {
            const validation = validateReadings(
                previousMeterInput ? previousMeterInput.value.trim() : '',
                currentMeterInput ? currentMeterInput.value.trim() : '',
                messages
            );

            if (errorMessage) {
                errorMessage.innerText = '';
            }

            if (consumptionElement) {
                consumptionElement.innerText = '';
            }

            if (calculateBillButton) {
                calculateBillButton.disabled = true;
            }

            if (validation.error) {
                if (errorMessage) {
                    errorMessage.innerText = validation.error;
                }
                return;
            }

            if (consumptionElement) {
                consumptionElement.innerText = validation.consumption.toFixed(1);
            }

            if (errorMessage && validation.warning) {
                errorMessage.innerText = validation.warning;
            }

            if (calculateBillButton) {
                calculateBillButton.disabled = false;
            }

            setStorageItem(STORAGE_KEYS.consumption, validation.consumption.toFixed(0));
            setStorageItem(STORAGE_KEYS.previousMeter, validation.current.toFixed(0));
            setStorageItem(STORAGE_KEYS.customerCategory, resolveCategory());
        };

        window.redirectToBillPage = function () {
            const category = resolveCategory();
            const targetUrl = category === DEFAULT_CATEGORY
                ? config.billUrl
                : config.billUrl + '?category=' + encodeURIComponent(category);

            window.location.href = targetUrl;
        };

        window.goBack = function () {
            window.location.href = config.homeUrl;
        };
    }

    function initBillPage(config) {
        const language = config.language || 'en';
        const messages = getMessages(language);
        const consumptionDetails = document.getElementById('consumptionDetails');
        const calculationSteps = document.getElementById('calculationSteps');
        const totalBill = document.getElementById('totalBill');
        const tariffVersion = document.getElementById('tariffVersion');

        document.documentElement.lang = language;
        applyBillTranslations(messages);

        window.goBack = function () {
            window.location.href = config.backUrl;
        };

        window.goTip = function () {
            window.location.href = config.tipsUrl;
        };

        window.calculateBill = function () {
            const category = resolveCategory();
            const consumption = Number(getStorageItem(STORAGE_KEYS.consumption));

            if (calculationSteps) {
                calculationSteps.innerHTML = '';
            }

            if (!Number.isFinite(consumption) || consumption < 0) {
                if (consumptionDetails) {
                    consumptionDetails.innerText = messages.bill.noConsumption;
                }

                if (totalBill) {
                    totalBill.innerText = '';
                }

                if (tariffVersion) {
                    tariffVersion.innerText = formatTemplate(messages.bill.tariffVersion, {
                        version: getVersionLabel(messages),
                        category: getCategoryName(messages, category)
                    });
                }

                return;
            }

            const bill = calculateBillByCategory(category, consumption);

            if (!bill) {
                return;
            }

            if (consumptionDetails) {
                consumptionDetails.innerText = formatTemplate(messages.bill.consumptionDetails, {
                    units: consumption.toFixed(0)
                });
            }

            if (calculationSteps) {
                bill.steps.forEach(function (step) {
                    const stepElement = document.createElement('p');
                    stepElement.innerText = step;
                    calculationSteps.appendChild(stepElement);
                });

                calculationSteps.appendChild(document.createElement('hr'));
                calculationSteps.appendChild(
                    document.createTextNode(
                        formatTemplate(messages.bill.fixedCharge, {
                            amount: formatMoney(bill.fixedCharge)
                        })
                    )
                );
            }

            if (totalBill) {
                totalBill.innerText = formatTemplate(messages.bill.totalBill, {
                    total: formatMoney(bill.total)
                });
            }

            if (tariffVersion) {
                tariffVersion.innerText = formatTemplate(messages.bill.tariffVersion, {
                    version: getVersionLabel(messages),
                    category: getCategoryName(messages, category)
                });
            }
        };

        window.calculateBill();
    }

    function initTariffDetailsPage(config) {
        const language = config.language || 'en';
        const messages = getMessages(language);
        const tariffVersionNote = document.getElementById('tariffVersionNote');

        document.documentElement.lang = language;
        applyDetailsTranslations(messages);
        renderTariffTables(language);

        if (tariffVersionNote) {
            tariffVersionNote.textContent = formatTemplate(messages.details.tariffVersionNote, {
                version: getVersionLabel(messages)
            });
        }
    }

    window.ElectricityBillApp = {
        initCalculatorPage: initCalculatorPage,
        initBillPage: initBillPage,
        initTariffDetailsPage: initTariffDetailsPage,
        calculateBillByCategory: calculateBillByCategory
    };
}(window, document));
