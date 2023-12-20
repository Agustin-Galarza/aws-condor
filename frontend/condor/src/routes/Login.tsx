//@ts-nocheck
import { useState } from 'react';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import UserPool from '../UserPool.js';
import { Form, useNavigate } from 'react-router-dom';
import Label from '../components/Label.js';
import userStore from '../store/userStore.js';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const { setToken } = userStore();

	const [error, setError] = useState('');

	const navigate = useNavigate();

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault();

		const user = new CognitoUser({
			Username: email,
			Pool: UserPool,
		});

		const authDetails = new AuthenticationDetails({
			Username: email,
			Password: password,
		});

		user.authenticateUser(authDetails, {
			onSuccess: data => {
				console.log('onSuccess: ', data);
				console.log('Id Token', data.getIdToken().getJwtToken());
				setToken(data.getIdToken().getJwtToken());
				navigate('/');
			},
			onFailure: err => {
				console.error('onFailure: ', err);
				setError(err.message);
			},
			newPasswordRequired: data => {
				console.log('newPasswordRequired: ', data);
				setError('Please reset your password.');
			},
		});
	};

	return (
		<section className="flex flex-col w-full items-center justify-center min-h-[calc(100vh-112px)] gap-10">
			<h1 className="text-4xl font-bold">Login</h1>
			<Form onSubmit={onSubmit} className="flex flex-col gap-4 ">
				<Label
					email={email}
					onChange={setEmail}
					id="email"
					type="text"
					label="Email"
				/>
				<Label
					email={password}
					onChange={setPassword}
					id="password"
					type="password"
					label="Password"
				/>
				<button
					type="submit"
					className="px-3 py-2 bg-red-500 font-extrabold rounded"
				>
					Login
				</button>
				<div className="w-full flex justify-end">
					<button
						onClick={() => navigate('/signup')}
						className="text-sm text-red-500 "
					>
						I do not have an account
					</button>
				</div>
			</Form>
			{error && <p className="text-red-500">{error}</p>}
		</section>
	);
};

export default Login;
