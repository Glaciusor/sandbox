
var dependencies, is_dev, host_path;

is_dev = false;
host_path = is_dev ? '' : 'http://glaciusor.github.com/sandbox/Draw/';

dependencies = [
	host_path + 'jQuery-1.7.1.min.js',
	host_path + 'jCanvas-5.1.js',
	host_path + 'SkriblMain.js'
];

if (window.parent) {
	require(dependencies, function (SkriblMain) {
		$('document').ready(function () {
			Skribl.initSkribl();
		});
	});
}
