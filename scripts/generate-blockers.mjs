import xml2js from "xml2js";
import xpath from "xml2js-xpath";
import * as fs from "node:fs";


const path = 'TriggerPackage'

fs.readFile('./data/Arkadia.xml', {encoding: 'utf8'}, function (err, data) {
    let results = []
    xml2js.parseString(data, (err,document) => {
        let matches = xpath
            .find(document, '//Trigger').filter(trigger => trigger.script.indexOf('trigger_func_mapper_blockers_blocker()') > -1)
            .map(trigger => {
                return trigger.regexCodeList[0].string.map((item, index) => ({pattern: item, type: trigger.regexCodePropertyList[0].integer[index]}))
            })
        results = results.concat(...matches)
    })
    fs.writeFileSync('blockers.json', JSON.stringify(results))
});