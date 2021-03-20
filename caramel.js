class Caramel {

    // Syntax constants
    CM_START_VAR_CHAR = '{{';
    CM_END_VAR_CHAR = '}}';
    CM_START_CSS_ATTR_CHAR = '[';
    CM_END_CSS_ATTR_CHAR = ']';

    // Variabiles
    loadingTime = '';
    DOMElements = [];

    // Settings
    printLoadingTime = true; 
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
     * Method that check if an attribute is a CSS attribute
     * @param {object} attribute - The attribute to check
     * @returns {boolean} Returns true if the attribute is a CSS attribute
     */
    isCSSAttribute(attribute) {
        return (
            attribute.name.substring(0, this.CM_START_CSS_ATTR_CHAR.length) === this.CM_START_CSS_ATTR_CHAR 
            && attribute.name.substring(attribute.name.length - this.CM_END_CSS_ATTR_CHAR.length, attribute.name.length) === this.CM_END_CSS_ATTR_CHAR
        );
    }

    /**
     * Method that loads an external CSS file and change every attribute adding the cm-component ID prefix.
     * Then add the content to a DOM element.
     * @param {object} target - The container of the component
     * @param {string} componentName - The name attribute of the component
     * @param {string} url - The CSS file URL
     * @callback - End the function
     */
    loadExternalCSS(target, componentName, url, callback) {
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                let resp = request.responseText;
                
                let finalCSS = '';
                const cssElements = resp.split('}');
                for (let cssElement of cssElements) {
                    let cssAttributeName = cssElement.match(/[^{]*/i)[0].trim();
                    if (cssAttributeName) {
                        let cssAttributeNameModified = `#cm-component-${componentName} ${cssAttributeName}`;
                        cssElement = cssElement.split(cssAttributeName).join(cssAttributeNameModified) + '}';
                    }
                    cssElement = cssElement.trim();
                    if (cssElement) finalCSS += cssElement;
                }

                const style = document.createElement('style');
                style.innerHTML = finalCSS;
                target.appendChild(style);
                return callback();
            }
        }
        request.send();
    }

    /**
     * Method that loads an external HTML file content into a DOM element
     * @param {object} target - The container of the component
     * @param {string} url - The HTML file URL
     * @callback - End the function
     */
    loadExternalHTML(target, url, callback) {
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                let resp = request.responseText;
                target.innerHTML = resp;
                return callback();
            }
        }
        request.send();
    }

    /**
     * Method that loads an external JS file content into the DOM head
     * @param {string} url - The JS file URL
     */
    appendJSToHead(url) {
        const head  = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        head.appendChild(script);
    }

    /**
     * Method that scans an HTML string and looks for matches of start and end string.
     * Then compiles a data object
     * @param {string} elementHTML - HTML element to scan
     * @param {string} startSearch - The first part of the string to find
     * @param {string} endSearch - The end part of the string to find
     * @param {boolean} isFromAttribute - If true the data will be searched inside an attribute
     * @returns {object[]} A list of objects that contains the data found inside the elements
     */
    generateDataFromOccurences(elementHTML, startSearch, endSearch, isFromAttribute) {

        // Escaping searches
        startSearch = startSearch.split('[').join('\\[');
        endSearch = endSearch.split(']').join('\\]');

        // Initializing variables
        let matches, data, param, toReplace, elementModified, found;
        let regex = new RegExp(`${startSearch}(.*?)${endSearch}`, 'g');
        let toReplaceFound = [];

        // Get all the occurrences and build the list of objects
        while (matches = regex.exec(elementHTML)) {

            // Matches data
            if (matches[1]) {
                param = matches[1].trim();
                toReplace = matches[0];

                // Check for data
                try {
                    
                    if (isFromAttribute) {
                        elementModified = document.createElement('div');
                        elementModified.innerHTML = elementHTML;
                        found = elementModified.querySelector('[' + toReplace.split('[').join('\\[').split(']').join('\\]') + ']');
                        data = eval(found.getAttribute(toReplace));
                    } else {
                        data = eval(param);
                    }

                    // Check for data
                    if (!data) this.warning(`The object ${param} is undefined.`);

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

        }

        return toReplaceFound;
        
    }
    
    /**
     * Method used to generate data for Caramel variables
     * @param {string} elementHTML - HTML element to scan
     * @returns {object[]} A list of objects that contains the data found inside the elements
     */
    generateVariablesData(elementHTML) {
        return this.generateDataFromOccurences(elementHTML, this.CM_START_VAR_CHAR, this.CM_END_VAR_CHAR);
    }

    /**
     * Method used to generate data for Caramel CSS attributes
     * @param {string} elementHTML - HTML element to scan
     * @returns {object[]} A list of objects that contains the data found inside the elements
     */
     generateCSSAttributesData(elementHTML) {
        return this.generateDataFromOccurences(elementHTML, this.CM_START_CSS_ATTR_CHAR, this.CM_END_CSS_ATTR_CHAR, true);
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
        } catch (error) {
            this.error(`The condition ${string} is not valid. ${error}`);
            return false;
        }
    }

    /**
     * Method that manages the cmIf elements, hiding those that don't return true
     */
    loadConditions() {
        const elements = document.documentElement.querySelectorAll('[cmif]');
        if (elements.length > 0) {
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

        for (let element of this.DOMElements) {
            if (!element.getAttribute('cmfor') && !element.getAttribute('api')) {

                // Get all the occurrences for the element
                let elementHTML = element.innerHTML;
                let toReplaceFound = this.generateVariablesData(elementHTML);

                // Replace all the occurrences found with the data
                let newElement = elementHTML;
                for (let item of toReplaceFound) {
                    if (item.data) {
                        newElement = newElement.split(item.toReplace).join(item.data);
                    }
                }

                // Replace original DOM element
                if (newElement != element.innerHTML) {
                    element.innerHTML = newElement;
                }
                
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
                let toReplaceFound = this.generateVariablesData(elementHTML);
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
                
                // Check for cmIf conditions
                const cmIfElements = elementModified.querySelectorAll('[cmif]');
                for (const cmIfElement of cmIfElements) {
                    if (!this.conditionEvaluate(cmIfElement.getAttribute('cmif'))) {
                        cmIfElement.remove();
                    }
                }

                // Generate final DOM element HTML
                if (!newElement) {
                    newElement = this.removeSpaces(elementModified.innerHTML);
                } else {
                    newElement += this.removeSpaces(elementModified.innerHTML);
                }
                
                elementModified.remove();
                dataCounter ++;

            }

            let finalElement = document.createElement('div');
            finalElement.innerHTML = newElement;
            
            // Check for cmIf conditions
            const cmIfElements = finalElement.querySelectorAll('[cmif]');
            for (const cmIfElement of cmIfElements) {
                cmIfElement.removeAttribute('cmif');
            }
            
            // Replace original element
            element.outerHTML = finalElement.innerHTML;

        }
    
    }

    loadCSSAttributes() {
        let elementCSS = '';
        let cssAttribute = '';
        const elementsFound = [];
        for (const element of this.DOMElements) {
            for (const attribute of element.attributes) {
                if (this.isCSSAttribute(attribute)) {
                    cssAttribute = attribute.name.replace(this.CM_START_CSS_ATTR_CHAR, '').replace(this.CM_END_CSS_ATTR_CHAR, '').trim();
                    try {
                        elementsFound.push(element);
                        elementCSS += `${cssAttribute}: ${eval(attribute.value)}; `;
                    } catch (error) {
                        elementCSS += `${cssAttribute}: ${attribute.value}; `;
                    }
                }
            }
            if (elementCSS) {
                element.setAttribute('style', elementCSS.trim());
                elementCSS = '';
                cssAttribute = '';
            }
        }

        // Remove CSS attributes
        for (const element of elementsFound) {
            for (const attribute of element.attributes) {
                if (attribute.name.substring(0, 1) === this.CM_START_CSS_ATTR_CHAR && attribute.name.slice(-1) === this.CM_END_CSS_ATTR_CHAR) {
                    element.removeAttribute(attribute.name);
                }
            }
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
            let toReplaceFound = this.generateVariablesData(elementHTML);
            for (let item of toReplaceFound) {
                this.checkForNumber(element, item.data);
                this.checkForNotNumber(element, item.data);
                this.checkForEvenNumber(element, item.data);
                this.checkForOddNumber(element, item.data);
            }
        }
    }

    loadComponents(callback) {
        const containers = document.documentElement.getElementsByTagName('cm-component');
        for (let container of containers) {
            const componentName = container.getAttribute('name').trim();
            container.setAttribute('id', `cm-component-${componentName}`);
            const thisInstance = this;
            try {
                this.appendJSToHead('./components/' + componentName + '/' + componentName + '.component.js');
                this.loadExternalHTML(container, './components/' + componentName + '/' + componentName + '.component.html', function() {
                    thisInstance.loadExternalCSS(container, componentName, './components/' + componentName + '/' + componentName + '.component.css', function() {
                        return callback();
                    });
                });
            } catch (error) {
                this.error('Error loading a component. ' + error);
            }
        }
    }

    /**
     * Method that saves the DOM elements inside an array.
     * @param {object[]} elementsList - The array list of the elements
     */
    popuplateDOMElementsArray(elementsList) {
        for (const domElement of elementsList) {
            if (!this.DOMElements.includes(domElement)) {
                this.DOMElements.push(domElement);
            }
        }
    }

    /**
     * Methot that loads all the DOM elements
     * Document elements in total are loaded last because I need the child components first
     */
    loadDOMElements() {
        const headElements = document.head.getElementsByTagName('*');
        const bodyElements = document.body.getElementsByTagName('*');
        const documentElements = document.documentElement.getElementsByTagName('*');
        this.popuplateDOMElementsArray(headElements);
        this.popuplateDOMElementsArray(bodyElements);
        this.popuplateDOMElementsArray(documentElements);
    }

    /**
     * Main method that loads Caramel
     * @param {string} loadingDescription - Optional text inside brackets while printing loading time
     */
    load(loadingDescription) {
        const startTime = new Date().getTime();
        this.loadDOMElements();
        this.apiCalls();
        this.loadTemplates();
        this.loadArrays();
        this.loadComplexConditions();
        this.loadConditions();
        this.loadVariables();
        this.loadCSSAttributes();
        const finalTime = new Date().getTime();
        this.loadingTime = 'Caramel.js loaded in ' + (finalTime - startTime) + 'ms';
        if (loadingDescription) this.loadingTime = `(${loadingDescription}) ${this.loadingTime}`;
        if (this.printLoadingTime) console.warn(this.loadingTime);
    }

}

var caramel = new Caramel();

window.onload = function() {

    // Caramel loading
    caramel.load();

    // Loading components and then reload Caramel
    caramel.loadComponents(function() {
        caramel.load('After components loading');
    });

}

// Caramel update after an AJAX call
if (window.jQuery) {
    $.ajaxSetup({
        complete: function (xhr, settings) {
            caramel.load('After AJAX request');
        }
    });
}
