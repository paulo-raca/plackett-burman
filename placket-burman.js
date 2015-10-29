function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

//Uncompresses a string "-++-..."  into an array [-1, +1, +1, -1, ....]
//If and array of strings is provided, uncompresses it into a 2-D array of +1/-1
function pb_unzip(x) {
    if (typeof x == "string") {
        return x.replace(/[^+-]/g, "").split("").map(function(v) {
            if (v == "+") return +1;
            if (v == "-") return -1;
        });
    } else {
        return x.map(pb_unzip);
    }
}

function pb_simple(str) {
    str = pb_unzip(str);
    var l = str.length;
    var ret = [];

    for (var i = 0; i < l; i++) {
        var row = [];
        for (var j = 0; j < l; j++) {
            var val = str[(i - j + l) % l];
            row.push(val);
        }
        ret.push(row);
    }

    var lastRow = [];
    for (var j = 0; j < l; j++) {
        lastRow.push(-1);
    }
    ret.push(lastRow);
    return ret;
};

//https://en.wikipedia.org/wiki/Hadamard_matrix#Sylvester.27s_construction
function pb_double(pb) {
    var l = pb.length;
    var ret = [];
    for (var i = 0; i < 2 * l; i++) {
        var row = [];
        for (var j = 0; j < 2 * l - 1; j++) {
            var ii = i % l;
            var jj = (j + 1) % l;
            var m = (j >= l - 1 && i >= l) ? -1 : 1;
            var v = jj == 0 ? 1 : pb[ii][jj - 1];
            row.push(v * m);
        }
        ret.push(row);
    }
    return ret;
};

function pb_blocks(table, blockSize) {
    table = pb_unzip(table);
    var H = table.length;
    var W = table[0].length;
    var pad = H - blockSize;
    var numBlocks = (W-pad) / blockSize;
    assert(H == pad + blockSize);
    assert(W == pad + blockSize*numBlocks);

    var ret = [];

    //Add padding lines
    for (var i = 0; i < pad; i++) {
        var row = [];
        for (var j = 0; j < W; j++) {
            var val = table[i][j];
            row.push(val);
        }
        ret.push(row);
    }

    for (var blockRow = 0; blockRow < numBlocks; blockRow++) {
        for (var i = 0; i < blockSize; i++) {
            var row = [];

            //Add padding columns
            for (var j = 0; j < pad; j++) {
                var val = table[i+pad][j];
                row.push(val);
            }

            for (var blockCol = 0; blockCol < numBlocks; blockCol++) {
                for (var j = 0; j < blockSize; j++) {
                    var jj = ((numBlocks+blockCol-blockRow)%numBlocks)*blockSize;
                    var val = table[i+pad][j+jj+pad];
                    row.push(val);
                }
            }

            ret.push(row);
        }
    }


    var lastRow = [];
    for (var j = 0; j < W; j++) {
        lastRow.push(-1);
    }
    ret.push(lastRow);
    return ret;
};

/**
 * Checks for the important properties of a PB table:
 * - Number of rows must be multiple of 4
 * - Each column (variable) should have the same amount of '+' and '-' values
 * - Each pair of lines should be orthogonal
 */
function pb_validate(pb) {
    var l = pb.length;
    assert(l % 4 == 0, "PB must be multiple of 4");

    for (var i = 0; i < pb.length; i++) {
        assert(pb[i].length == l - 1, "M = N-1");
    }
    for (var j = 0; j < l - 1; j++) {
        var sum = 0;
        for (var i = 0; i < l; i++) {
            sum += pb[i][j];
        }
        assert(sum == 0, "Each column should have same amount of '+' and '-'");
    }

    for (var a = 0; a < l; a++) {
        for (var b = a + 1; b < l; b++) {
            var dot = 1;
            for (var j = 0; j < l - 1; j++) {
                dot += pb[a][j] * pb[b][j];
            }
            assert(dot == 0, "Lines " + a + " and " + b + " should be orthogonal (dot is " + dot + ")");
        }
    }
};

//Mostly a literal transcript of the table of designs for L=2
function pb_get() {
    PB = {};
    PB[  8] = pb_simple(
        "+++-+--");
    PB[ 12] = pb_simple(
        "++-+++---+-");
    PB[ 16] = pb_simple(
        "++++-+-++--+---");
    PB[ 20] = pb_simple(
        "++--++++-+-+----++-");
    PB[ 24] = pb_simple(
        "+++++-+-++--++--+-+----");
    PB[ 28] = pb_blocks([
        "+-++++---|-+---+--+|++-+-++-+",
        "++-+++---|--++--+--|-++++-++-",
        "-+++++---|+---+--+-|+-+-++-++",
        "---+-++++|--+-+---+|+-+++-+-+",
        "---++-+++|+----++--|++--++++-",
        "----+++++|-+-+---+-|-+++-+-++",
        "+++---+-+|--+--+-+-|+-++-+++-",
        "+++---++-|+--+----+|++-++--++",
        "+++----++|-+--+-+--|-++-+++-+"
    ], 9);
    PB[ 32] = pb_simple(
        "----+ -+-++ +-++- --+++ ++--+ +-+-- +");
    PB[ 36] = pb_simple(
        "-+-++ +---+ ++++- +++-- +---- +-+-+ +--+-");
    PB[ 40] = pb_double(PB[20]);
    PB[ 44] = pb_simple(
        "++--+ -+--+ ++-++ +++-- -+-++ +---- -+--- ++-+- ++-");
    PB[ 48] = pb_simple(
        "+++++ -++++ --+-+ -+++- -+--+ +-++- --+-+ -++-- --+----");
    PB[ 52] = pb_blocks([
        "+|+-+-+-+-+-|+-+-+-+-+-|+-+-+-+-+-|+-+-+-+-+-|+-+-+-+-+-",

        "+|-+--------|++----++++|++++--++--|++--++--++|++++++----",
        "-|++-+-+-+-+|+--+-++-+-|+-+--++--+|+--++--++-|+-+-+--+-+",
        "+|---+------|++++----++|--++++--++|++++--++--|--++++++--",
        "-|-+++-+-+-+|+-+--+-++-|-++-+--++-|+-+--++--+|-++-+-+--+",
        "+|-----+----|++++++----|++--++++--|--++++--++|----++++++",
        "-|-+-+++-+-+|+-+-+--+-+|+--++-+--+|-++-+--++-|-+-++-+-+-",
        "+|-------+--|--++++++--|--++--++++|++--++++--|++----++++",
        "-|-+-+-+++-+|-++-+-+--+|-++--++-+-|+--++-+--+|+--+-++-+-",
        "+|---------+|----++++++|++--++--++|--++--++++|++++----++",
        "-|-+-+-+-+++|-+-++-+-+-|+--++--++-|-++--++-+-|+-+--+-++-"
    ], 10);
    PB[ 56] = pb_double(PB[28]);
    PB[ 60] = pb_simple(
        "++-++ +-+-+ --+-- +++-+ +++-- +++++ ----- ++--- -+--- ++-++ -+-+- --+-");
    PB[ 64] = pb_double(PB[32]);
    PB[ 68] = pb_simple(
        "++--+ -+--+ +---+ +++-+ -++++ ++--+ ---+- +++-+ +---- --+-+ ----+ ++--+ +-+-+ +-");
    PB[ 72] = pb_simple(
        "+++++ ++-++ +-+-- ++-++ +---+ +-+-+ +-+-- -+++- +--+- +--++ +---+ --++- +---+ ----- -");
    PB[ 76] = pb_blocks([
        "++-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-",
        "+-+--++----++++--++--------++++++--++++++++--++++++--------++--++++----++--",
        "-++-++--+-++-+--++--+-+-+-++-+-+--++-+-+-+--++-+-+--+-+-+-++--++-+--+-++--+"
    ], 2);
    PB[ 80] = pb_simple(
        "+++-+ +--++ ++-+- -+-++ ++++- ++--- -++-- -+-+- +-+-+ ++--+ +++-- +---- --+-+ +-+-- --++- -+--");
    PB[ 84] = pb_simple(
        "++-++ --+-+ +++-- -++-- -+-+- +++++ ++-+- -+++- ++--+ ---++ -+--- ----+ -+-++ +--++ +---- +-++- -+-");
    PB[ 88] = pb_double(PB[44]);
    //PB[ 92] = "This design has not yet been obtained"
    PB[ 96] = pb_double(PB[48]);
    PB[100] = pb_blocks([
        "+ +-+-+-+-+-+-+- +-+-+-+-+-+-+- +-+-+-+-+-+-+- +-+-+-+-+-+-+- +-+-+-+-+-+-+- +-+-+-+-+-+-+- +-+-+-+-+-+-+-",
        "+ -+------------ ++--++++--++-- ++----++++--++ ++++++------++ ++++------++++ ++++--++++---- ++--++--++++--",
        "- ++-+-+-+-+-+-+ +--++-+--++--+ +--+-++-+--++- +-+-+--+-+-++- +-+--+-+-++-+- +-+--++-+--+-+ +--++--++-+--+",
        "+ ---+---------- --++--++++--++ ++++----++++-- ++++++++------ ++++++------++ --++++--++++-- --++--++--++++",
        "- -+++-+-+-+-+-+ -++--++-+--++- +-+--+-++-+--+ +-+-+-+--+-+-+ +-+-+--+-+-++- -++-+--++-+--+ -++--++--++-+-",
        "+ -----+-------- ++--++--++++-- --++++----++++ --++++++++---- ++++++++------ ----++++--++++ ++--++--++--++",
        "- -+-+++-+-+-+-+ +--++--++-+--+ -++-+--+-++-+- -++-+-+-+--+-+ +-+-+-+--+-+-+ -+-++-+--++-+- +--++--++--++-",
        "+ -------+------ --++--++--++++ ++--++++----++ ----++++++++-- --++++++++---- ++----++++--++ ++++--++--++--",
        "- -+-+-+++-+-+-+ -++--++--++-+- +--++-+--+-++- -+-++-+-+-+--+ -++-+-+-+--+-+ +--+-++-+--++- +-+--++--++--+",
        "+ ---------+---- ++--++--++--++ ++++--++++---- ------++++++++ ----++++++++-- ++++----++++-- --++++--++--++",
        "- -+-+-+-+++-+-+ +--++--++--++- +-+--++-+--+-+ -+-+-++-+-+-+- -+-++-+-+-+--+ +-+--+-++-+--+ -++-+--++--++-",
        "+ -----------+-- ++++--++--++-- --++++--++++-- ++------++++++ ------++++++++ --++++----++++ ++--++++--++--",
        "- -+-+-+-+-+++-+ +-+--++--++--+ -++-+--++-+--+ +--+-+-++-+-+- -+-+-++-+-+-+- -++-+--+-++-+- +--++-+--++--+",
        "+ -------------+ --++++--++--++ ----++++--++++ ++++------++++ ++------++++++ ++--++++----++ --++--++++--++",
        "- -+-+-+-+-+-+++ -++-+--++--++- -+-++-+--++-+- +-+--+-+-++-+- +--+-+-++-+-+- +--++-+--+-++- -++--++-+--++-"
    ], 14);

    return PB;
}

module.exports = {
    tables: pb_get(),
    validate: pb_validate
}
