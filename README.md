# Caramel.js
Caramel.js allows you to use JavaScript variables, arrays, and objects inside HTML files, importing just one JavaScript file.
<br><br>
One of the biggest problems of using jQuery or pure JavaScript is that you can't iterate through objects, after a server response for example.
<br>You can't even write the content of a JS variable in a readable way.
<br>Caramel is the solution to this problems. You can:
- Iterate through arrays and print variables and objects inside the HTML.
- Check for variable values and hide/show blocks of code if the condition is not true.
- Load parts of code that is repeated (templates).
## Getting started
You can import the JS file in two ways:
1. Using the HTTPS link to the file: https://creativajs.altervista.org/caramel-js/0.1/caramel.js
2. With offline file. If you want to use the offline file just download the archive, import the **caramel.js** file in your project and use it into your HTML.
## Tested browsers
- Chrome
- Firefox
- Microsoft Edge (the new one)
- Safari

It doesn't work with the old Internet Explorer and the old Microsoft Edge.
## Examples
Basic example:
```
<script>
    var exampleVar = 'This text comes from a variable';
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
        <title>Caramel.js - Example</title>
    </head>
    <body>
        {{ exampleVar }}
    </body>
</html>
```
You can download the archive from GitHub and try the **examples.html** file.
Or you can go here: https://creativajs.altervista.org/caramel-js/0.1/examples.html
## Things to keep in mind
- Place the **caramel.js** file before the CSS stylesheets in order to avoid visible DOM changes.
- If you want to use jQuery, include it before Caramel.
## How to use variables
To use variables you just have to create a JavaScript variable and then call it with the brackets {{ example }}.
You can declare variables inside the HTML page or into an external page, it doesn't matter.
```
<script>
    var exampleVar = 'This text comes from a variable';
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
        <title>Caramel.js - Example</title>
    </head>
    <body>
        {{ exampleVar }}
    </body>
</html>
```
## Variables inside HTML parameters
```
<script>
    var googleURL = 'https://www.google.com/';
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
    </head>
    <body>
        <a href="{{ googleURL }}">Google URL</a>
    </body>
</html>
```
## Variables inside HTML parameters concatenated
You can concatenate text and variables in this simple way:
```
<script>
    var googleURL = 'https://www.google.com/';
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
    </head>
    <body>
        <a href="{{ googleURL }}?q=hello">Search on Google</a>
    </body>
</html>
```
## If conditions
If you want to test a condition just use the **cmIf** parameter:
```
<script>
    var exampleObject = 'hello';
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
    </head>
    <body>
        <p cmIf="exampleObject === 'hello'">
            I am visible only if the condition is true.
        </p>
    </body>
</html>
```
## How to use simple objects
Just navigate inside the object with the dot (.) like you do in JavaScript.
```
<script>
    var exampleObject = { test: { internal: 'hello' } }
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
    </head>
    <body>
        <p>
            {{ exampleObject.test.internal }}
        </p>
    </body>
</html>
```
## How to iterate a simple array (without objects)
To iterate a simple array you need to use the **cmFor** HTML attribute on the element you want to duplicate, and the **cmItem** attribute to specify the variable name of the element inside the loop. You can choose any name you want for the variable.
```
<script>
    var arrayExample = [
        "Orange",
        "Banana",
        "Apple",
        "Kiwi"
    ];
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
    </head>
    <body>
        <ul>
            <li cmFor="arrayExample" cmItem="item">
                {{ item }}
            </li>
        </ul>
    </body>
</html>
```
## How to iterate array of objects
To iterate an array of objects you need to use the **cmFor** HTML attribute on the element you want to duplicate, and the **cmItem** attribute to specify the variable name of the element inside the loop. You can choose any name you want for the variable.
```
<script>
    var exampleArray = [
        { id: 1, name: 'Luke' },
        { id: 2, name: 'Martin' },
        { id: 3, name: 'Chuck' }
    ]
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
    </head>
    <body>
        <ul>
            <li cmFor="exampleArray" cmItem="item">
               {{ item.id }} - {{ item.name }}
            </li>
        </ul>
    </body>
</html>
```
## How to iterate nested array of objects
It's simple like the previous examples.
```
<script>
    var nestedObjects = { test: [
        { id: 1, name: 'Luke' },
        { id: 2, name: 'Martin' },
        { id: 3, name: 'Chuck' }
    ] }
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
    </head>
    <body>
        <ul>
            <li cmFor="nestedObjects.test" cmItem="item">
                {{ item.name }}
            </li>
        </ul>
    </body>
</html>
```
## How to know if an array item is first or last
You can use this simply attributes to know if an array element you are scanning is last or first: **ifFirst, ifLast, ifNotFirst, ifNotLast**.
```
<script>
    var objectWithArrayOfObjects = {
        "batter":
            [
                { "id": "1001", "type": "Regular" },
                { "id": "1002", "type": "Chocolate" },
                { "id": "1003", "type": "Blueberry" },
                { "id": "1004", "type": "Devil's Food" }
            ]
    }
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
    </head>
    <body>
        <ul>
            <li cmFor="objectWithArrayOfObjects.batter" cmItem="item">
                <p ifNotLast ifNotFirst>{{ item.type }}</p>
                <p ifFirst>{{ item.type }} <b>THIS IS FIRST</b></p>
                <p ifLast>{{ item.type }} <b>THIS IS LAST</b></p>
            </li>
        </ul>
    </body>
</html>
```
## How to know if an array number is even or odd
You can use this simply attributes to know if an array number you are scanning is even or odd: **ifEven, ifOdd**.
```
<script>
    var objectWithArrayOfObjects = {
        "batter":
            [
                { "id": 1001, "type": "Regular" },
                { "id": 1002, "type": "Chocolate" },
                { "id": 1003, "type": "Blueberry" },
                { "id": 1004, "type": "Devil's Food" }
            ]
    }
</script>

<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
    </head>
    <body>
        <ul>
            <li cmFor="objectWithArrayOfObjects.batter" cmItem="item">
                <p ifEven>{{ item.id }} <b>THIS IS EVEN</b></p>
                <p ifOdd>{{ item.id }} <b>THIS IS ODD</b></p>
            </li>
        </ul>
    </body>
</html>
```
## Load HTML template
You can use block of code called **templates**. This is very useful when you have to use a block of code multiple times.
```
<html>
    <head>
        <script src="https://creativajs.altervista.org/caramel-js/0.1/caramel.js"></script>
    </head>
    <body>

        <div cm-template="my-template"></div>

        <cm-template name="my-template">
            <!-- All the stuff -->
        </cm-template>

    </body>
</html>
```
## Custom brackets
If you are using the offline JS file (caramel.js) you can customize the brackets and use any character you want. Just edit the constants at the beginning of the class:
- CM_START_VAR_CHAR
- CM_END_VAR_CHAR

You can use one or two characters. For example [[ test ]] or [ test ].
## How to reload variables and lists
If you did an API request, for example, you might want to reload the lists. Just call the method **caramel.loadArrays()** to reload every list.
If you want to reload the variables call the method **caramel.loadVariables()**.
If you want to reload everything call the method **caramel.load()**.
The default behavior is that after the page is loaded the varibles and the lists will be loaded.
If you are using jQuery the variables and the lists will be automatically reloaded after that the AJAX request has finished.
