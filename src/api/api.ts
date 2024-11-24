import { endpoint } from "../main/version";

export namespace API {
  const BASE_URL = endpoint;

  const headers = {
    "Content-Type": "application/json"
  }

  export async function get<T>(url: string): Promise<T> {
    return fetch(BASE_URL + url, {
      method: "GET",
      headers: headers,
    }).then((res) => res.json()) as Promise<T>;
  }

  export async function post<T>(url: string, body: any): Promise<T> {
    return fetch(BASE_URL + url, {
      method: "POST",
      headers: {
        ...headers,
      },
      body: JSON.stringify(body),
    }).then((res) => res.json()) as Promise<T>;
  }

}
