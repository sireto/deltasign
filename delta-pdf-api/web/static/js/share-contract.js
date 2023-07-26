var shareLink = document.getElementById("share-contract-open-in-app");
var href = location.href;
var newHref;
if (href.includes('https')) {
    newHref = href.replace('https', 'delta')
} else {
    newHref = href.replace('http', 'delta')
}
shareLink.href = newHref;