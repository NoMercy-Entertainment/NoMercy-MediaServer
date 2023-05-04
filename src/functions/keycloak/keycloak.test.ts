import { getKeycloak, getKeycloakKeys, initKeycloak } from './keycloak';

import axios from 'axios';

jest.mock('axios');

describe('Authentication', () => {
	describe('initKeycloak', () => {
		it('should initialize Keycloak and return the instance', () => {
			const keycloak = initKeycloak();

			expect(keycloak).toBeDefined();
		});
	});

	describe('getKeycloak', () => {
		it('should return the instance of Keycloak', () => {
			const keycloak = initKeycloak();
			const result = getKeycloak();
			expect(result).toBe(keycloak);
		});
	});
	describe('getKeycloakKeys', () => {
		it('should return a public key from the Keycloak realm', async () => {

			const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvaBW29r6UigIr1kFswixQGhdRVIzAQz+G/pS3IGnFoTP/qgy1Nu1Yd2f2a2pO1CJjRmTZdAQRHYE76X/Awa3Bj2xdtUyhYujKuG3038Ag8iWr4rBB3F9N0Qw1+/Zmnr//V4UKLb4f2dP9A2AzeEuHnAnctG+gAc3MDMmPkewNWXztcSlCIyhJLHZFMmhxKg3zbJRYR4UhFX0VFhSWgVgretvrq5m5S1Y+yC5Jkl8ALmKkn4k6wKPZq7n10VZMr029ti++AkB0yEZJrFgyyxDq5ETi3VpDFudxw6jDxXmTfWs+WCxBKIcwbrOPvJIKspsVuGxeVCMIu9CXgOtjCDxIwIDAQAB';
			const data = { public_key: publicKey };
			const getMock = axios.get as jest.Mock;
			getMock.mockResolvedValueOnce({ data });

			const result = await getKeycloakKeys();

			expect(result).toMatch('-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvaBW29r6UigIr1kFswixQGhdRVIzAQz+G/pS3IGnFoTP/qgy1Nu1Yd2f2a2pO1CJjRmTZdAQRHYE76X/Awa3Bj2xdtUyhYujKuG3038Ag8iWr4rBB3F9N0Qw1+/Zmnr//V4UKLb4f2dP9A2AzeEuHnAnctG+gAc3MDMmPkewNWXztcSlCIyhJLHZFMmhxKg3zbJRYR4UhFX0VFhSWgVgretvrq5m5S1Y+yC5Jkl8ALmKkn4k6wKPZq7n10VZMr029ti++AkB0yEZJrFgyyxDq5ETi3VpDFudxw6jDxXmTfWs+WCxBKIcwbrOPvJIKspsVuGxeVCMIu9CXgOtjCDxIwIDAQAB\n-----END PUBLIC KEY-----');
		});
	});
});
