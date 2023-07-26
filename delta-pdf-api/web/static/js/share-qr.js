/// qr code
var qr;
(function() {
        qr = new QRious({
        element: document.getElementById('share-contract-qrcode'),
        size: 300,
        value: ''
    });
})();

/// on window ready,  load qr code
window.onload = generateQRCode();

/// qr code to show
function generateQRCode() {
        ///
        var urlParams = new URLSearchParams(window.location.search);
        var href = location.href;
        /// contract draft id
        var contractId = urlParams.get("draft_id");
        var urlHost = window.location.host;
        var qrText = "https://"+urlHost+"/share-contract?draft_id="+contractId;
        qr.set({
            foreground: 'black',
            value: qrText,
            size: 300,
        });
}