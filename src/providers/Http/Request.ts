import BaseRequest from './BaseRequest';

class Request extends BaseRequest {

	protected setHeaders(headers: { [key: string]: string | number; }): this {
		this.withHeaders(headers);
		return this;
	}

	protected setBody(body: unknown): this {
		this.withBody(body);
		return this;
	}

	protected setQuery(query: { [key: string]: string | number; }): this {
		this.withQuery(query);
		return this;
	}

	protected setParams(params: { [key: string]: string | number | boolean | undefined; }): this {
		this.withParams(params);
		return this;
	}

	protected setToken(token: string): this {
		this.withToken(token);
		return this;
	}

	protected setBaseUrl(baseUrl: string): this {
		this.withBaseUrl(baseUrl);
		return this;
	}

	protected json() {
		return this.axios[this.method](this.url)
			.then((response: { data: any; }) => response.data);
	}


}

export default Request;
