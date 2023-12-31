function handler(event) {
	var request = event.request;
	var uri = request.uri;
	var paths = ['assets', 'condor.svg'];
	var isServerPath = path => uri.includes(path);

	if (!paths.some(isServerPath)) {
		request.uri = '/';
	}

	return request;
}
