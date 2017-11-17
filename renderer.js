const path = require('path');
const SubDB = require('subdb');
const guessit = require('guessit-wrapper');
const subdb = new SubDB();
const remote = require('electron').remote;

const dropbox = document.getElementById('dropbox');
const main = document.getElementById('main');


document.getElementById("close-btn").addEventListener("click", function (e) {
    console.log();
    var window = remote.getCurrentWindow();
    window.close();
}); 

document.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropbox.innerHTML = '<i style="font-size: 80px;" class="fa fa-circle-o-notch fa-spin"></i>'
    for (let f of e.dataTransfer.files) {
        guessit.parseName(f.name).then(function (data) {
            subByHash(f, data, (err, res)=> {
                createElement(res);
                console.log(res);
            })
        });
    }
});
document.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
});
dropbox.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropbox.style.transform = 'scale(0.9)';
});
dropbox.addEventListener('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropbox.style.transform = 'scale(1)';
});

var firstRun = true;

function createElement(data) {
    if(firstRun) {
        main.innerHTML = '';
        firstRun = false;
    }
    if(data.success) {
        var color = '#acf39d';
        var icon = 'check';
    } else {
        var color = '#ce4660';
        var icon = 'times';
    }
    if(data.guessed) {
        if(data.guessed.type == 'episode' && data.guessed.episodeNumber && data.guessed.season && data.guessed.series) {
            var epNumber = data.guessed.episodeNumber;
            var seasonNumber = data.guessed.season;
            if(data.guessed.episodeNumber.length = 1) {
                epNumber = '0' + data.guessed.episodeNumber;
            }
            if(data.guessed.season.lenght = 1) {
                seasonNumber = '0' + data.guessed.season;
            }
            var season = 'S' + epNumber + 'E' + seasonNumber;
            main.innerHTML += '<div class="card"><p id="title">' + data.guessed.series + ' ' +season + '</p><p id="icon"><i style="color: ' + color + ';"class="fa fa-' + icon + '"></i></p></div>';
        } else if(data.guessed.type == 'movie' && data.guessed.year && data.guessed.title) {
            main.innerHTML += '<div class="card"><p id="title">' + data.guessed.title + ' (' + data.guessed.year + ')' + '</p><p id="icon"><i style="color: ' + color + ';"class="fa fa-' + icon + '"></i></p></div>';
        }
    } else {
        main.innerHTML += '<div class="card"><p id="title">' + data.file.name.replace(path.parse(data.file.name).ext, '') + '</p><p id="icon"><i style="color: ' + color + ';"class="fa fa-' + icon + '"></i></p></div>';
    }
}

function subByHash(file, guessed, callback) {
    subdb.computeHash(file.path, function (err, res) {
        if (err) return err;

        var hash = res;
        subdb.api.search_subtitles(hash, function (err, res) {

            if(err) console.log(err);
            if(!res) callback(err, { file: file, guessed, success: false });
            if(res) {
                subdb.api.download_subtitle(hash, res.join(','), file.path.replace(path.parse(file.name).ext, '') + '.srt', function (err, res) {
                    if (err) return err;
                    callback(err, { file: file, guessed, success: true });
                });
            }       

        });
    });
}