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

import { V1Pod, V1ObjectMeta, V1PodSpec, V1PodStatus } from "@kubernetes/client-node";
// import YAML from 'yaml';

export interface PodOverview {
    name: string,
    application?: string,
    containersReady: number,
    restarts: number,
    age: number,
    ip: string,
    node: string,
    created: Date,
}

export interface PodParams {
    name: string;
    report: V1Pod;
    metadata?: V1ObjectMeta;
    spec?: V1PodSpec;
    status?: V1PodStatus;
}

export class Pod {

    static build(params: PodParams): Pod {
        return new Pod(
            params.name,
            params.report,
            params.metadata,
            params.spec,
            params.status,
        );
    }

    static buildFromReport(report: V1Pod): Pod {
        const metadata = report.metadata;
        const spec = report.spec;
        const status = report.status;
        const name: string | null = metadata?.name ? metadata.name : "";
        return Pod.build({ name, report, metadata, spec, status });
    }

    constructor(
        public name: string,
        public report: V1Pod,
        public metadata?: V1ObjectMeta,
        public spec?: V1PodSpec,
        public status?: V1PodStatus,
    ) { };

    // public getReportYAML(this: Pod): string {
    //     return YAML.stringify(this.report);
    // }

} 