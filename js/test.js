
$(function () {

    startScanner();

});

let elem = document.getElementById("history_table");
elem.innerHTML = '<tr><th>ID</th><th>作成者</th></tr>';

const startScanner = () => {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#photo-area'),
            constraints: {
                decodeBarCodeRate: 3,
                successTimeout: 500,
                codeRepetition: true,
                tryVertical: true,
                frameRate: 15,
                width: 640,
                height: 480,
                facingMode: "environment"
            },
        },
        decoder: {
            readers: [
                "code_39_reader"
            ]
        },

    }, function (err) {
        if (err) {
            console.log(err);
            return
        }

        console.log("Initialization finished. Ready to start");
        Quagga.start();

        // Set flag to is running
        _scannerIsRunning = true;
    });

    Quagga.onProcessed(function (result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {
                        x: 0,
                        y: 1
                    }, drawingCtx, {
                        color: "green",
                        lineWidth: 2
                    });
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {
                    x: 0,
                    y: 1
                }, drawingCtx, {
                    color: "#00F",
                    lineWidth: 2
                });
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {
                    x: 'x',
                    y: 'y'
                }, drawingCtx, {
                    color: 'red',
                    lineWidth: 3
                });
            }
        }
    });

    //barcode read call back
    Quagga.onDetected(function (result) {
        console.log(result.codeResult.code);
        check_search(result.codeResult.code);
    });
}

const pre_list = [
  ["0017","X年12月05日","E"],
  ["0005","X年12月04日","E"],
  ["0002","X年12月03日","E"],
  ["0007","X年12月05日","F"],
  ["0003","X年12月04日","F"],
  ["0085","X年12月03日","F"],
  ["0019","X年12月05日","G"],
  ["0011","X年12月04日","G"],
  ["0046","X年12月03日","G"],
  ["0029","X年12月05日","H"],
  ["0091","X年12月04日","H"],
  ["0057","X年12月03日","H"],
  ["0638","X年11月11日","S"]
];

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));
const trans_list = transpose(pre_list);

let read = [];
let html_hist = '';

let check_search = (result) => {
  if(result!==read[read.length-1] && result.length===4){
      let num= trans_list[0].indexOf(result);
      if(num!== -1){
        read.push(result);
        html_hist = '<tr><th>'+pre_list[num][0]+'</th><th>'+pre_list[num][2]+'</th></tr>' + html_hist;
        elem.innerHTML = '<tr><th>ID</th><th>作成者</th></tr>'+html_hist;
      }else if(result.match(/^[A-Z]{4}$/)!==null){
        alert("このコードは\n"+result+"\nです");
      }
  }

}
