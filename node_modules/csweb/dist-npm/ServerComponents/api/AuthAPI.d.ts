import express = require('express');
import ApiManager = require('./ApiManager');
import Feature = ApiManager.Feature;
export declare class AuthAPI {
    private manager;
    private server;
    private baseUrl;
    userUrl: string;
    loginUrl: string;
    signupUrl: string;
    constructor(manager: ApiManager.ApiManager, server: express.Express, baseUrl?: string);
    private getUser(req, res);
    private updateUser(req, res);
    private login(req, res);
    private signup(req, res);
    private ensureAuthenticated(req, res, next);
    private static createJWT(user);
    private unlinkProvider(req, res);
    private googleLogin(req, res);
    private githubLogin(req, res);
    private linkedinLogin(req, res);
    private windowsLiveLogin(req, res);
    private facebookLogin(req, res);
    private yahooLogin(req, res);
    private twitterLogin(req, res);
    private foursquareLogin(req, res);
    private twitchLogin(req, res);
}
export interface IUser {
    email: string;
    password?: string;
    displayName?: string;
    roles?: string;
    picture?: string;
    facebook?: string;
    foursquare?: string;
    google?: string;
    github?: string;
    linkedin?: string;
    live?: string;
    yahoo?: string;
    twitter?: string;
    twitch?: string;
}
export declare class User extends Feature implements IUser {
    static manager: ApiManager.ApiManager;
    password: string;
    email: string;
    displayName: string;
    roles: string;
    picture: string;
    facebook: string;
    foursquare: string;
    google: string;
    github: string;
    linkedin: string;
    live: string;
    yahoo: string;
    twitter: string;
    twitch: string;
    constructor(user?: IUser);
    private static getTeam(teamId, callback);
    static findById(teamId: string, id: string, callback: (err: string, user: User) => void): void;
    static findOne(teamId: string, keys: {
        [key: string]: string;
    }, callback: (err: string, user: User) => void): void;
    static load(): void;
    save(teamId: string, callback: (err: string) => void): void;
    comparePassword(password: string, done: (err: Error, isMatch: boolean) => void): void;
}
