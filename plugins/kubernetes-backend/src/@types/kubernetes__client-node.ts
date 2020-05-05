/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// declare module '@kubernetes/client-node' {

//     export interface ClusterResponse {
//         readonly name: string;
//         readonly server: string;
//         readonly skipTLSVerify: boolean;
//         readonly caData?: string;
//         readonly caFile?: string;
//     }

//     export interface PodResponse {

//     }

//     export class CoreV1Api { }

//     type ApiType = {};

//     type ApiConstructor<T extends ApiType> = new (server: string) => T;

//     export class KubeConfig {
//         loadFromDefault(): void;
//         makeApiClient<T extends ApiType>(api: ApiConstructor<T>): ApiConstructor<T>;
//         getClusters(): ClusterResponse[];
//     }
// }