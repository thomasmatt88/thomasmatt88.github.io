I will kickstart my blogging journey by distilling a very important concept from perhaps the most popular Data Engineering blogpost of all time, ["Functional Data Engineering -- a modern paradigm for batch data processing"](https://maximebeauchemin.medium.com/functional-data-engineering-a-modern-paradigm-for-batch-data-processing-2327ec32c42a). That is the concept of incrementally processing "late-arriving data". 

"Late-arriving" data is very common in Internet of Things (IOT) systems. Edge devices often temporarily lose connection to a central server -- while the data stream is interrupted the device can continue recording data. The Cloud data platform team at Tesla (named Fleet Analytics at the time I worked there), digests massive amounts of data and a good portion of that data is "late-arriving" as millions of Tesla vehicles have intermittent connection to Tesla's cloud. **Big data needs to be processed as soon as data arrives but should not be reprocessed.** The strategy to incrementally process "late-arriving" data, detailed below, was heavily evangelized by the Fleet Analytics team.

It is critical to dissociate *event timestamp* (when event occured or measuremment was made), *received timestamp* (when record was ingested to cloud), and *processing timestamp* (when record was processed in data pipeline). As mentioned in IOT systems, there can be a significant lag between event timestamp and received timestamp. For illustrative purposes we will only deal with date format and assume received date and processing date are always equal. 

<h2>Problem Statement</h2>
Assume we want to track the total number of alerts of our fleet over time -- ensure it is trending down and we are alerted to any spikes.

![Figure 1](figure1.png)

<h2>Data Pipeline</h2>

SOURCE_TABLE -> ALERT_COUNTS_INCREMENTAL -> ALERT_COUNTS_FINAL


<table>
  <thead>
    <tr>
      <th>A</th>
      <th>B</th>
      <th>C</th>
    </tr>
  </thead>
  <tbody>
    <tr style="color: green;"><td>1</td><td>2000-03-31</td><td>2001-01-01</td></tr>
    <tr style="color: orange;"><td>1</td><td>2000-03-31</td><td>2001-03-20</td></tr>
    <tr style="color: blue;"><td>1</td><td>2000-03-31</td><td>2001-04-10</td></tr>
  </tbody>
</table>