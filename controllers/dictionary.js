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

// @desc      Get word meaning
// @route     GET /api/meaning/oxford/:word
// @access    Public
exports.getMeaning = asyncHandler(async (req, res, next) => {

    let word = req.params.word;
    let response = {};
    const categories = [];
    const definitions = [];

    const props = {
        word: word,
        //filter: "lexicalCategory=noun, verb, adjective, adverb, pronoun"
        // target_language: "es"
    };

    var lookup = dict.find(props);

    await lookup.then((resp) => {

        if (resp && resp.results) {
            resp.results[0].lexicalEntries.map(lexEnt => {
                categories.push(lexEnt.lexicalCategory.text);
                const definitions2 = [];
                lexEnt.entries.forEach((entry, index) => {
                    lexEnt.entries[index].senses.forEach((sense, index2) => {
                        definitions2.push(lexEnt.entries[index].senses[index2].definitions[0]);
                    })
                })
                definitions.push(definitions2);
            })
            if (categories !== undefined && definitions !== undefined) {

                Object.assign(response, { categories: categories }, { definitions: definitions })
            }
            if (Object.keys(response).length !== 0 && response.constructor === Object) {
                res
                    .status(200)
                    .json({
                        success: true,
                        response
                    });
            }

        }
    })
        .catch((err) => console.log(err))

    if (Object.keys(response).length === 0 && response.constructor === Object && response.definitions === undefined) {
        await Http.open("get", `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${key}`)
        await Http.send();

        let resp;
        Http.onreadystatechange = (e) => {
            if (Http.readyState === 4) {
                if (Http.status === 200) {
                    resp = JSON.parse(Http.responseText);
                    if (resp && resp[0] && resp[0].constructor === Object) {
                        if ('meta' in resp[0]) {
                            // categories.push(`From ${response[0].meta.id}`)
                            const meta = resp[0].meta.id.replace(/[0-9]/g, '').replace(/:/g, '');
                            if (word.toLowerCase() !== meta) {
                                categories.push(`from "${meta}"`);
                                definitions.push([])
                            }
                            resp.forEach(res => {
                                categories.push(res.fl)
                                definitions.push(res.shortdef)
                            })
                        }
                    }
                    if (categories !== undefined && definitions !== undefined) {
                        Object.assign(response, { categories: categories }, { definitions: definitions })
                    }
                    console.log(response);
                    res
                        .status(200)
                        .json({
                            success: true,
                            response
                        });

                }

            }
        }

    }



})
// @desc      Validate word
// @route     GET /api/meaning/validate/:word
// @access    Public
exports.validate = asyncHandler(async (req, res, next) => {

    let word = req.params.word;
    let response = false;

    await Http.open("get", `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${key}`)
    await Http.send();

    let resp;
    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {
            if (Http.status === 200) {
                resp = JSON.parse(Http.responseText);
                if (resp && resp[0] && resp[0].constructor === Object) {
                    response = true;
                    res
                        .status(200)
                        .json({
                            success: true,
                            response
                        });
                } else {
                    res
                        .status(200)
                        .json({
                            success: true,
                            response
                        });
                }
            }
        }

    }
})


