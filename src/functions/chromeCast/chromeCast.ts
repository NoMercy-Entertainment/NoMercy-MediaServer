import ChromecastAPI from 'chromecast-api';
import { setCast } from '../../state/redux/system/actions';

export const chromeCast = () => {

    const client = new ChromecastAPI();

    client.on('device', () => {
        setCast([...client.devices]);
    });
};

export default chromeCast;
