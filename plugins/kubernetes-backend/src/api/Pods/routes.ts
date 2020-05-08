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

import { Router, Request, Response } from 'express'
import {
    getAllNamespacedPods,
    getNamespacedPods,
    getNamespacedPod,
    IGetNamesacedPods,
    IGetNamesacedPodFromName,
} from './methods'
import { Pod } from './models'
import { KubeConfig } from '@kubernetes/client-node';

export const bindRoutes = (router: Router): void => {

    router.get('/v1/getAllNamespacedPods',
        async (
            _: Request,
            res: Response<Pod[]>) => {
            const kc: KubeConfig = new KubeConfig();
            kc.loadFromDefault();
            const pods: Pod[] = await getAllNamespacedPods(kc);
            res.json(pods);
        });

    router.get('/v1/getNamespacedPods/:podOptions',
        async (
            req: Request,
            res: Response) => {
            const kc: KubeConfig = new KubeConfig();
            kc.loadFromDefault();
            const options: IGetNamesacedPods = JSON.parse(req.params.podOptions);
            const pods: Pod[] = await getNamespacedPods(kc, options);
            res.json(pods);
        });

    router.get('/v1/getNamespacedPod/:podOptions', async (req: Request, res: Response<Pod>) => {
        const kc: KubeConfig = new KubeConfig();
        kc.loadFromDefault();
        const options: IGetNamesacedPodFromName = JSON.parse(req.params.podOptions);
        const pod: Pod = await getNamespacedPod(kc, options);
        res.json(pod);
    })

}