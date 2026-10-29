<svelte:head>
    <title>Footballs</title> 
</svelte:head>

<script>

import PocketBase from 'pocketbase';

const pb = new PocketBase('https://db.aarosmit.com');

async function getData () {
        let resultList = await pb.collection('gps').getFullList({
            sort: "-tst"
        });
        console.log(resultList)

        for (let i = 1; i < resultList.length; i++) {
            if (resultList[i - 1].tst === resultList[i].tst) {
                console.log(`${resultList[i - 1].id} will be deleted`)
                // await pb.collection('gps').delete(resultList[i - 1].id)
            }
        }
}

getData()

</script>