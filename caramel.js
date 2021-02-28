class Caramel {

    // Syntax constants
    CM_START_VAR_CHAR = '{{';
    CM_END_VAR_CHAR = '}}';

    // Variabiles
    loadingTime = '';
    DOMElements = [];

    // Settings
    printLoadingTime = false;
    hideWarnings = true;
    hideErrors = false;

    constructor() {

    }

    /**
     * Method that prints an error log if the enabled
     * @param {string} text - The text to print
     */
    error(text) {
        if (!this.hideErrors) console.error(text);
    }

    /**
     * Method that prints a warning log if the enabled
     * @param {string} text - The text to print
     */
    warning(text) {
        if (!this.hideWarnings) console.warn(text);
    }

    /**
     * Method that removes all the spaces in a string
     * @param {string} string - The string to edit
     * @returns {string} The original string without spaces
     */
    removeSpaces(string) {
        return string.replace(/(>)\s+|\s+(<)/g, "$1$2");
    }

    /**
     * Method that removes all the HTML comments inside the page
     */
    removeHTMLComments() {
        const pageHTML = document.documentElement.innerHTML;
        document.documentElement.innerHTML = pageHTML.replace(/<!--[\s\S]*?-->/g, '');
    }

    /**
     * Method that scans an HTML string and looks for matches
     * @param {string} elementHTML - Element HTML to scan
     * @returns {object[]} A list of objects that contains the data found inside the elements
     */
    findOccurrences(elementHTML) {

        // Initializing variables
        let matches, data, param, toReplace;
        let regex = new RegExp(`${this.CM_START_VAR_CHAR}(.*?)${this.CM_END_VAR_CHAR}`, 'g');
        let toReplaceFound = [];

        // Get all the occurrences and build the list of objects
        while (matches = regex.exec(elementHTML)) {

            // Matches data
            param = matches[1].trim();
            toReplace = matches[0];

            // Check for data
            try {
                data = eval(param);
                if (!data) {
                    this.warning(`The object ${param} is undefined.`);
                }
            } catch {
                this.warning(`The object ${param} is undefined.`);
            }

            // Object building
            let object = {
                element: elementHTML,
                param,
                toReplace,
                data
            };
            
            toReplaceFound.push(object);

        }

        return toReplaceFound;

    }

    /**
     * Method that evaluates a string
     * @param {string} string - The DOM elements to scan
     * @returns {boolean} Returns true if the condition is valud
     */
    conditionEvaluate(string) {
        try {
            let checkCondition = eval(string);
            return checkCondition;
        } catch(error) {
            this.error(`The condition ${string} is not valid: ${error}`);
            return false;
        }
    }

    /**
     * Method that manages the cmIf elements, hiding those that don't return true
     * @param {object[]} elements - The DOM elements to scan
     */
    loadConditions(elements) {
        if (elements.length > 1) {
            for (let element of elements) {
                let cmIf = element.getAttribute('cmif');
                if (!this.conditionEvaluate(cmIf)) element.remove();
                element.removeAttribute('cmif');
            }
        }
    }

    /**
     * Method that manages the ifFirst attribute
     * @param {object} element - The DOM element to scan
     * @param {number} index - The index of the element inside the data list
     */
    checkForIfFirstElement(element, index) {
        const ifFirstElements = element.querySelectorAll('[ifFirst]');
        for (const ifElement of ifFirstElements) {
            ifElement.removeAttribute('ifFirst');
            if (index > 0) {
                ifElement.remove();
            }
        }
    }

    /**
     * Method that manages the ifLast attribute
     * @param {object} element - The DOM element to scan
     * @param {number} index - The index of the element inside the data list
     * @param {number} dataMaxIndex - The length of the data list
     */
    checkForIfLastElement(element, index, dataMaxIndex) {
        const ifLastElements = element.querySelectorAll('[ifLast]');
        for (const ifElement of ifLastElements) {
            ifElement.removeAttribute('ifLast');
            if (index < dataMaxIndex - 1) {
                ifElement.remove();
            }
        }
    }

    /**
     * Method that manages the ifNotFirst and ifNotLast attributes
     * @param {object} element - The DOM element to scan
     * @param {number} index - The index of the element inside the data list
     * @param {number} dataMaxIndex - The length of the data list
     */
    checkForIfNotFirstAndIfNotLast(element, index, dataMaxIndex) {

        const ifNotFirstElements = element.querySelectorAll('[ifNotFirst]');
        const ifNotLastElements = element.querySelectorAll('[ifNotLast]');

        for (const ifNotFirstElement of ifNotFirstElements) {
            for (const ifNotLastElement of ifNotLastElements) {

                if (ifNotLastElement && ifNotFirstElement) {
                    ifNotFirstElement.removeAttribute('ifNotFirst');
                    ifNotLastElement.removeAttribute('ifNotLast');
                    if (index === 0 || index === dataMaxIndex - 1) {
                        ifNotFirstElement.remove();
                    }
                } else if (ifNotLastElement) {
                    ifNotLastElement.removeAttribute('ifNotLast');
                    if (index === dataMaxIndex.length - 1) {
                        ifNotLastElement.remove();
                    }
                } else if (ifNotFirstElement) {
                    ifNotFirstElement.removeAttribute('ifNotFirst');
                    if (index === 0) {
                        ifNotFirstElement.remove();
                    }
                }

            }
        }

    }

    /**
     * Method that manages the ifNumber attribute
     * @param {object} element - The DOM element to scan
     * @param {any} data - The data to check
     */
    checkForNumber(element, data) {
        const ifNumberElements = element.querySelectorAll('[ifNumber]');
        for (const ifElement of ifNumberElements) {
            ifElement.removeAttribute('ifNumber');
            if (isNaN(data)) {
                ifElement.remove();
            }
        }
    }

    /**
     * Method that manages the ifNotNumber attribute
     * @param {object} element - The DOM element to scan
     * @param {any} data - The data to check
     */
    checkForNotNumber(element, data) {
        const ifNotNumberElements = element.querySelectorAll('[ifNotNumber]');
        for (const ifElement of ifNotNumberElements) {
            ifElement.removeAttribute('ifNotNumber');
            if (!isNaN(data)) {
                ifElement.remove();
            }
        }
    }

    /**
     * Method that manages the ifEven attribute
     * @param {object} element - The DOM element to scan
     * @param {any} data - The data to check
     */
    checkForEvenNumber(element, data) {
        const ifEvenElements = element.querySelectorAll('[ifEven]');
        for (const ifElement of ifEvenElements) {
            ifElement.removeAttribute('ifEven');
            if (isNaN(data)) {
                this.warning('The data "' + data + '" is not a number.');
                ifElement.remove();
            } else {
                if (data % 2 !== 0) {
                    ifElement.remove();
                }
            }
        }
    }

    /**
     * Method that manages the ifEven attribute
     * @param {object} element - The DOM element to scan
     * @param {any} data - The data to check
     */
    checkForOddNumber(element, data) {
        const ifOddElements = element.querySelectorAll('[ifOdd]');
        for (const ifElement of ifOddElements) {
            ifElement.removeAttribute('ifOdd');
            if (isNaN(data)) {
                this.warning('The data "' + data + '" is not a number.');
                ifElement.remove();
            } else {
                if (data % 2 == 0) {
                    ifElement.remove();
                }
            }
        }
    }

    /**
     * Method that manages the variables inside the DOM elements
     */
    loadVariables() {
        
        // Get all the DOM elements
        const elements = document.documentElement.getElementsByTagName('*');

        for (let element of elements) {
            if (!element.getAttribute('cmfor') && !element.getAttribute('api')) {

                // Get all the occurrences for the element
                let elementHTML = element.innerHTML;
                let toReplaceFound = this.findOccurrences(elementHTML);

                // Replace all the occurrences found with the data
                let newElement = elementHTML;
                for (let item of toReplaceFound) {
                    if (item.data) {
                        newElement = newElement.split(item.toReplace).join(item.data);
                    }
                }

                // Replace original DOM element
                element.innerHTML = newElement;

            }
        }
        
    }

    /**
     * Method that loads all the Caramel templates
     */
    loadTemplates() {

        // DOM elements
        const templates = document.getElementsByTagName('cm-template');
        const containers = document.querySelectorAll('[cm-template]');

        for (let container of containers) {
            for (let template of templates) {

                // Hiding the template
                template.style.display = 'none';

                // Adding the template
                const templateName = container.getAttribute('cm-template');
                if (template.getAttribute('name') === templateName) {
                    container.innerHTML = template.innerHTML;
                    container.removeAttribute('cm-template');
                }

            }
        }

        // Remove templates
        for (let template of templates) {
            template.remove();
        }

        // Check for templates not found
        for (let container of containers) {
            const templateName = container.getAttribute('cm-template');
            if (templateName) this.warning(`Template not found: ${templateName}.`);
        }

    }

    /**
     * Method that manages the arrays inside the DOM elements
     */
    loadArrays() {

        // Get all cmFor DOM elements
        const elements = document.documentElement.querySelectorAll('[cmfor]');

        for (let element of elements) {

            // API element
            let isAPIElement = element.getAttribute('api');

            // Get element attributes
            let cmFor = element.getAttribute('cmfor');
            let cmItem = element.getAttribute('cmItem');

            // Skip iteration if the cmItem is not specified
            if (!cmItem) {
                this.error(`You must specify a cmItem name for this cmFor: ${cmFor}.`);
                continue;
            }

            let forData;
            try {
                forData = eval(cmFor);
            } catch(error) {
                this.warning(`The cmFor data of ${cmFor} is undefined.`);
                continue;
            }

            if (!forData) {
                this.warning(`The cmFor data of ${cmFor} is undefined.`);
                continue;
            }

            // Remove element attributes
            element.removeAttribute('cmfor');
            element.removeAttribute('cmitem');

            let elementHTML;
            let newElement = '';
            let dataCounter = 0;

            for (let data of forData) {
                
                window[cmItem] = data;

                // Show hidden API elements
                if (isAPIElement) {
                    element.removeAttribute('api');
                    if (element.tagName.toLowerCase() === 'li') {
                        element.style.display = 'list-item';
                    } else {
                        element.style.display = 'block';
                    }
                }

                elementHTML = element.outerHTML;
                let toReplaceFound = this.findOccurrences(elementHTML);
                if (!toReplaceFound || toReplaceFound.length < 1) continue;

                // Replace element occurrences
                let elementToAppend = '';
                let elementModified;

                for (let item of toReplaceFound) {
                    
                    if (!elementToAppend) {
                        elementToAppend = elementHTML.split(item.toReplace).join(item.data);
                    } else {
                        elementToAppend = elementToAppend.split(item.toReplace).join(item.data);
                    }

                    elementModified = document.createElement('div');
                    elementModified.innerHTML = elementToAppend;

                    // Check for complex conditions
                    this.checkForIfFirstElement(elementModified, dataCounter);
                    this.checkForIfLastElement(elementModified, dataCounter, forData.length);
                    this.checkForIfNotFirstAndIfNotLast(elementModified, dataCounter, forData.length);
                    this.checkForNumber(elementModified, item.data);
                    this.checkForNotNumber(elementModified, item.data);
                    this.checkForEvenNumber(elementModified, item.data);
                    this.checkForOddNumber(elementModified, item.data);

                }

                // Generate final DOM element HTML
                if (!newElement) {
                    newElement = this.removeSpaces(elementModified.innerHTML);
                } else {
                    newElement += this.removeSpaces(elementModified.innerHTML);
                }

                dataCounter ++;

            }
            
            // Replace original element
            element.outerHTML = newElement;

        }
    
    }

    /**
     * Method that hide all the API HTML blocks before the server response
     */
    apiCalls() {
        let components = document.documentElement.querySelectorAll('[api]');
        for (let item of components) {
            item.style.display = 'none';
        }
    }

    /*
     * Method that manages all the complex conditions such as ifNumber, ifEven
     */
    loadComplexConditions() {
        const elements = document.documentElement.getElementsByTagName('*');
        let elementHTML = '';
        for (let element of elements) {
            elementHTML = element.innerHTML;
            let toReplaceFound = this.findOccurrences(elementHTML);
            for (let item of toReplaceFound) {
                this.checkForNumber(element, item.data);
                this.checkForNotNumber(element, item.data);
                this.checkForEvenNumber(element, item.data);
                this.checkForOddNumber(element, item.data);
            }
        }
    }

    loadDOMElements() {
        const elements = document.documentElement.getElementsByTagName('*');
        this.DOMElements = elements;
        console.log(this.DOMElements);
    }

    /**
     * Main method that loads Caramel
     */
    load() {
        const startTime = new Date().getTime();
        //this.loadDOMElements();
        this.apiCalls();
        this.removeHTMLComments();
        this.loadTemplates();
        this.loadComplexConditions();
        this.loadArrays();
        this.loadConditions(document.documentElement.querySelectorAll('[cmif]'));
        this.loadVariables();
        const finalTime = new Date().getTime();
        this.loadingTime = 'Caramel.js loaded in ' + (finalTime - startTime) + 'ms';
        if (this.printLoadingTime) console.warn(this.loadingTime);
    }

}

var caramel = new Caramel();

window.onload = function() {
    caramel.load();
}

// Caramel update after an AJAX call
if (window.jQuery) {
    $.ajaxSetup({
        complete: function (xhr, settings) {
            caramel.load();
        }
    });
}
