const StatsService = {
    getLatestResults: async ({count=100, board='soft'}: {count: number, board: string}) => {
        let url = '/api/results/?';

        if (count) {
            url+= `&count=${count}`
        }
        if (board) {
            url+= `&board=${board}`
        }

        try {
            let results = await fetch(url);
            let json = await results.json();
            return json;
        } catch (e) {
            console.error(e)
        }
    },
    addResult: async (result: any) => {
        let url = '/api/results';
        try {
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(result)
            });
            let json = await response.json();
            return json;
        } catch (e) {
            console.error('couldnt post');
            console.error(e);
        }
    }
}

export default StatsService;

