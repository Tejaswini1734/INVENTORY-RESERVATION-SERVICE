const TOTAL_REQUESTS = 20;

async function runTest() {
  const requests = [];

  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    requests.push(
      fetch('http://localhost:3000/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'product-1',
          quantity: 1,
          ttlMinutes: 15,
        }),
      })
        .then(async (response) => ({
          success: response.ok,
          status: response.status,
          body: await response.json(),
        }))
        .catch((error) => ({
          success: false,
          error: error.message,
        }))
    );
  }

  const results = await Promise.all(requests);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log('========================');
  console.log('CONCURRENCY TEST RESULT');
  console.log('========================');
  console.log(`Total Requests : ${TOTAL_REQUESTS}`);
  console.log(`Successful     : ${successful.length}`);
  console.log(`Failed         : ${failed.length}`);

  console.log('\nSuccessful Reservations:');
  successful.forEach((r, index) => {
    console.log(`${index + 1}. ${r.body.id}`);
  });

  console.log('\nFailed Requests:');
  failed.forEach((r, index) => {
    console.log(`${index + 1}. Status: ${r.status}`);
  });
}

runTest();