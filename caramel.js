class Caramel {

    // Syntax constants
    CM_START_VAR_CHAR = '{{';
    CM_END_VAR_CHAR = '}}';

    constructor() {

    }

    /**
     * Method that returns all the DOM elements with a specific attribute name
     * @param {string} attribute - The attribute to search for
     * @returns {any[]} A list of DOM elements
     */
    getAllElementsWithAttribute(attribute) {
        return document.querySelectorAll('[' + attribute + ']');
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
                    console.error(`The object ${param} is undefined.`);
                }
            } catch {
                console.error(`The object ${param} is undefined.`);
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
     * Method that manages the cmIf elements
     */
    loadConditions() {

        // Get all the cmIf elements
        const elements = this.getAllElementsWithAttribute('cmif');

        // Check for the elements to hide
        for (let element of elements) {
            let cmIf = element.getAttribute('cmif');
            try {
                let checkCondition = eval(cmIf);
                if (!checkCondition) {
                    element.remove();
                }
            } catch(error) {
                console.error(`The condition ${cmIf} is not valid.`);
            }
            element.removeAttribute('cmif');
        }

    }

    /**
     * Method that manages the variables inside the DOM elements
     */
    loadVariables() {
        
        // Get all the DOM elements
        const elements = document.documentElement.getElementsByTagName('*');

        for (let element of elements) {

            // Get all the occurrences for the element
            let elementHTML = element.innerHTML;
            let toReplaceFound = this.findOccurrences(elementHTML);

            // Replace all the occurrences found with the data
            let newElement = elementHTML;
            for (let item of toReplaceFound) {
                newElement = this.removeSpaces(newElement).split(item.toReplace).join(item.data);
            }

            // Replace original DOM element
            element.innerHTML = newElement;

        }
        
    }

    /**
     * Method that loads all the Caramel templates
     */
    loadTemplates() {

        // DOM elements
        const templates = document.getElementsByTagName('cm-template');
        const containers = this.getAllElementsWithAttribute('cm-template');

        for (let container of containers) {
            for (let template of templates) {

                // Hiding the template
                template.style.display = 'none';

                // Adding the template
                const templateName = container.getAttribute('cm-template');
                if (template.getAttribute('name') === templateName) {
                    container.innerHTML = template.innerHTML;
                    container.removeAttribute('cm-template');
                    template.remove();
                }

            }
        }

        // Check for templates not found
        for (let container of containers) {
            const templateName = container.getAttribute('cm-template');
            if (templateName) console.warn(`Template not found: ${templateName}.`);
        }

    }

    /**
     * Main method that loads Caramel
     */
    load() {
        this.removeHTMLComments();
        this.loadTemplates();
        this.loadConditions();
        this.loadVariables();
    }

}

window.onload = function() {

    // Caramel load
    var caramel = new Caramel();
    caramel.load();

    // Caramel update after an AJAX call
    if (window.jQuery) {
        $.ajaxSetup({
            complete: function (xhr, settings) {
                caramel.load();
            }
        });
    }

}
