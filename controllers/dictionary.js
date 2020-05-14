const Dictionary = require('oxford-dictionary');
const asyncHandler = require('../middleware/async');

//instantiate dictionary as singleton
const config = {
    app_id: "b52d3e18",
    app_key: process.env.OXFORD_KEY,
    source_lang: "en-us"
};
const dict = new Dictionary(config);

const key = "ee45ee9d-510f-4b5e-81f1-7bb7f90d3ffe";
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Http = new XMLHttpRequest();

const getWordData = (word) => {
    Http.open("get", `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${key}`)
    Http.send();

    Http.onreadystatechange = (e) => {
        console.log(Http.responseText)
    }

}

// @desc      Get word meaning
// @route     PUT /api/meaning/oxford/:word
// @access    Public
exports.oxfordMeaning = asyncHandler(async (req, res, next) => {

    let word = req.params.word;
    let response = {};
    let top;

    const props = {
        word: word,
        //filter: "lexicalCategory=noun, verb, adjective, adverb, pronoun"
        // target_language: "es"
    };

    var lookup = dict.find(props);

    await lookup.then((res) => {
        if (res && res.results) {
            res.results.map((result, index) => {
                const obj = {}
                result.lexicalEntries.map((entry, index2) => {
                    const def = [];
                    entry.entries.map(index3 => {
                        index3.senses.map(index => {
                            if (index.definitions != null) {
                                def.push(index.definitions[0]);
                            }
                            else {
                                def.push(index.crossReferenceMarkers[0]);
                            }
                        })
                    })
                    Object.assign(obj, { [entry.lexicalCategory.text]: def })
                })
                Object.assign(response, { [index]: obj })
            })

        }
    })
        .catch((err) => console.log(err))

    if (Object.keys(response).length === 0 && response.constructor === Object) {
        console.log("runs")
        getWordData(word)

    }


    res
        .status(200)
        .json({
            success: true,
            response
        });
})

