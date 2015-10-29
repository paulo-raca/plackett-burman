var PB = require("./placket-burman.js");
var fs = require("fs");

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

function to_markdown(pb) {
    contents = "## Placket-Burman " + pb.length + "\n\n";
    for (var i=0; i<pb.length; i++) {
        for (var j=0; j<pb[i].length; j++) {
            contents+="| ";
            contents+=pb[i][j] > 0 ? " 1" : "-1";
            contents+=" ";
        }
        contents+="|\n";
    }
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
    var all_markdown = [];

    for (var i=8; i<=100; i+=4) {
        if (PB.tables[i]) {
            print_validation(PB.tables[i]);

            writeFile("PB-"+i, "tables/placket-burman-" + i + ".csv", to_csv(PB.tables[i]));
            writeFile("PB-"+i, "tables/placket-burman-" + i + ".json", to_json(PB.tables[i]));

            var markdown = to_markdown(PB.tables[i]);
            all_markdown.push(markdown);
            writeFile("PB-"+i, "tables/placket-burman-" + i + ".md", markdown);
        }
    }

    writeFile("all tables", "tables/placket-burman-all.json", to_json(PB.tables));
    writeFile("all tables", "tables/placket-burman-all.md", all_markdown.join("\n\n"));
}

if (require.main === module) {
    main();
}
