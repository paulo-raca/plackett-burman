var PB = require("./placket-burman.js");
var fs = require("fs");
var XLSX = require('xlsx');

function print_validation(pb) {
    line = "PB" + pb.length + ": ";
    try {
        PB.validate(pb);
        line += "VALID!";
    } catch (err) {
        line += "Invalid - " + err + "\n";
        for (var i = 0; i < pb.length; i++) {
            for (var j = 0; j < pb[i].length; j++) {
                line += pb[i][j] > 0 ? "+" : "-";
            }
            line += "\n";
        }
    }
    console.log(line);
};

function to_csv(pb) {
    contents = "";
    for (var i=0; i<pb.length; i++) {
        for (var j=0; j<pb[i].length; j++) {
            if (j>0) {
                contents+=", ";
            }
            contents+=pb[i][j] > 0 ? " 1" : "-1";
        }
        contents+="\n";
    }
    return contents;
};

function to_xlsx(pbs) {
    /* set up workbook objects -- some of these will not be required in the future */
    var workbook = {}
    workbook.Sheets = {};
    workbook.Props = {};
    workbook.SSF = {};
    workbook.SheetNames = [];

    for (var x=0; x<pbs.length; x++) {
        var pb = pbs[x];
        var worksheet = {};
        var worksheet_name = "PB " + pb.length;

        /* Iterate through each element in the structure */
        for(var i=0; i<pb.length; i++) {
            for(var j=0; j<pb[i].length; j++) {
                var cell = {
                    v: pb[i][j],
                    t: 'n'
                };
                var cell_ref = XLSX.utils.encode_cell({ r:i, c:j });
                worksheet[cell_ref] = cell;
            }
        }
        var range = {s: {c:0, r:0}, e: {c:pb[0].length, r:pb.length }};
        worksheet['!ref'] = XLSX.utils.encode_range(range);

        /* add worksheet to workbook */
        workbook.SheetNames.push(worksheet_name);
        workbook.Sheets[worksheet_name] = worksheet;
    }

    /* write file */
    return XLSX.write(workbook,  { bookType:'xlsx', bookSST:false, type:'buffer' });
};

function to_markdown(pb) {
    contents = "## Placket-Burman " + pb.length + "\n\n";

    /* github doesn't like tables without headers... Use HTML instead
    for (var i=0; i<pb.length; i++) {
        for (var j=0; j<pb[i].length; j++) {
            contents+="| ";
            contents+=pb[i][j] > 0 ? " 1" : "-1";
            contents+=" ";
        }
        contents+="|\n";
    }*/

    contents+="<table>\n";
    for (var i=0; i<pb.length; i++) {
        contents+="  <tr>";
        for (var j=0; j<pb[i].length; j++) {
            contents+="<td>";
            contents+=pb[i][j] > 0 ? " 1" : "-1";
            contents+="</td>";
        }
        contents+="</tr>\n";
    }
    contents+="</table>\n";
    return contents;
};

function to_json(pb) {
    json = JSON.stringify(pb, null, 2);

    //Put all digits aligned on the same line
    json = json.replace(/1,\n(\s*)/g, "1, ");
    json = json.replace(/ 1/g, "  1");

    return json;
};

function writeFile(description, filename, contents) {
    fs.writeFile(filename, contents, function(err) {
        if(err) {
            console.warn("Failed to save " + description + " to " + filename, err);
        } else {
            console.log("Saved " + description + " to " + filename);
        }
    });
};



function main() {
    var all_tables = [];
    var all_markdown = [];

    for (var i=8; i<=100; i+=4) {
        if (PB.tables[i]) {
            var markdown = to_markdown(PB.tables[i]);
            all_markdown.push(markdown);
            all_tables.push(PB.tables[i]);

            writeFile("PB-"+i, "tables/placket-burman-" + i + ".csv", to_csv(PB.tables[i]));
            writeFile("PB-"+i, "tables/placket-burman-" + i + ".json", to_json(PB.tables[i]));
            writeFile("PB-"+i, "tables/placket-burman-" + i + ".xlsx", to_xlsx([PB.tables[i]]));
            writeFile("PB-"+i, "tables/placket-burman-" + i + ".md", markdown);

            console.log("- [PB-" + i + "](tables/placket-burman-"+i+".md): [XLSX](tables/placket-burman-"+i+".xlsx) / [JSON](tables/placket-burman-"+i+".json) / [CSV](tables/placket-burman-"+i+".csv)");
        }
    }
    console.log("- [All tables](tables/placket-burman-all.md): [XLSX](tables/placket-burman-all.xlsx) / [JSON](tables/placket-burman-all.json)");

    writeFile("all tables", "tables/placket-burman-all.json", to_json(PB.tables));
    writeFile("all tables", "tables/placket-burman-all.md", all_markdown.join("\n\n"));
    writeFile("all tables", "tables/placket-burman-all.xlsx", to_xlsx(all_tables));
}

if (require.main === module) {
    main();
}
