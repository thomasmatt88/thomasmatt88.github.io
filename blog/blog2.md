<br>
<br>

Data warehouses involve *write-once, read-many* aggregate (COUNT, SUM, AVG, MIN, or MAX) workloads. It is wasteful to crunch through common aggregations every query. Futhermore, it may not be prudent to allow readers to spin up huge clusters to perform expensive queries. Instead, these common query results should be calculated once, cached, and available to all readers. One way to do so is with a **materialized view**.

<h3> Materialized View vs View </h3>

- Both are a table-like object whose contents are the results of some query 
- A Materialized View is an actual copy of the query results, written to disk. When the underlying data changes, a materialized view needs to be updated, because it is a denormalized copy of the data. The database can do that automatically, but such updates make writes more expensive, which is why materialized views are not often used in write-heavy OLTP databases. In read-heavy data warehouses, such as OLAP, they can make more sense. Materialized views can also be updated/refreshed on a schedule (e.g. once per day) instead of whenever the underlying data changes.
- A standard (virtual) View is just a shortcut for writing queries. When you read from a virtual view, the SQL engine expands it into the view’s underlying query on the fly and then processes the expanded query. 

```sql
CREATE MATERIALIZED VIEW mv AS SELECT * FROM my_table;
REFRESH MATERIALIZED VIEW mv
```

A common special case of a materialized view is known as a **Data Cube** or **OLAP Cube** 
- grid of aggregates grouped by different dimensions 
- The advantage of a materialized data cube is that certain queries become very fast because they have effectively been precomputed. 

![Figure 2](figure2.png)

In general, facts often have more than two dimensions. E.g. five dimensions: date, product, store, promotion, and customer. It’s a lot harder to imagine what a five-dimensional hypercube would look like, but the principle remains the same: each cell contains the sales for a particular date-product-store-promotion-customer combination. These values can then repeatedly be summarized along each of the dimensions. 

The disadvantage is that a data cube doesn’t have the same flexibility as querying the raw data. In example above, there is no way of calculating which proportion of sales comes from items that cost more than $100, because the price isn’t one of the dimensions. Most data warehouses therefore try to keep as much raw data as possible, and use aggregates such as data cubes only as a performance boost for certain queries. 

The number of combinations of aggregations is not solely dependend on the number of dimensions of the cube. **Cardinality** of each dimension plays an important role. Cardinality is the uniqueness of data values in a dimension. Low cardinality means that a column has a lot of duplicate values in its set. High cardinality means that the column contains a large percentage of completely unique values. A column containing a single value will always be the lowest possible cardinality. A column containing unique IDs will always be the highest possible cardinality.
<br>
<br>
Consider the slice of the datacube below:
<table>
  <thead>
    <tr>
      <th>year=2024</th>
      <th>dunkin</th>
      <th>peets</th>
      <th>starbucks</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>coffee</th>
      <td>8</td>
      <td>3</td>
      <td>10</td>
      <td>21</td>
    </tr>
    <tr>
      <th>juice</th>
      <td>3</td>
      <td>1</td>
      <td>2</td>
      <td>6</td>
    </tr>
    <tr>
      <th>pastries</th>
      <td>6</td>
      <td>3</td>
      <td>5</td>
      <td>14</td>
    </tr>
    <tr>
      <th>sandwhich</th>
      <td>5</td>
      <td>2</td>
      <td>6</td>
      <td>13</td>
    </tr>
    <tr>
      <th>total</th>
      <td>22</td>
      <td>9</td>
      <td>23</td>
      <td>54</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th>year=2024</th>
      <th>dunkin</th>
      <th>peets</th>
      <th>starbucks</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>coffee</th>
      <td style="background-color: yellow;">8</td>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">10</td>
      <td>21</td>
    </tr>
    <tr>
      <th>juice</th>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">1</td>
      <td style="background-color: yellow;">2</td>
      <td>6</td>
    </tr>
    <tr>
      <th>pastries</th>
      <td style="background-color: yellow;">6</td>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">5</td>
      <td>14</td>
    </tr>
    <tr>
      <th>sandwhich</th>
      <td style="background-color: yellow;">5</td>
      <td style="background-color: yellow;">2</td>
      <td style="background-color: yellow;">6</td>
      <td>13</td>
    </tr>
    <tr>
      <th>total</th>
      <td>22</td>
      <td>9</td>
      <td>23</td>
      <td>54</td>
    </tr>
  </tbody>
</table>

```sql
SELECT
    store_name,
    product,
    SUM(quantity) AS total
FROM dbo.fact_sales
WHERE sale_year = 2024
GROUP BY store_name, product;
```

<table>
  <thead>
    <tr>
      <th>year=2024</th>
      <th>dunkin</th>
      <th>peets</th>
      <th>starbucks</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>coffee</th>
      <td style="background-color: yellow;">8</td>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">10</td>
      <td>21</td>
    </tr>
    <tr>
      <th>juice</th>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">1</td>
      <td style="background-color: yellow;">2</td>
      <td>6</td>
    </tr>
    <tr>
      <th>pastries</th>
      <td style="background-color: yellow;">6</td>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">5</td>
      <td>14</td>
    </tr>
    <tr>
      <th>sandwhich</th>
      <td style="background-color: yellow;">5</td>
      <td style="background-color: yellow;">2</td>
      <td style="background-color: yellow;">6</td>
      <td>13</td>
    </tr>
    <tr>
      <th>total</th>
      <td style="background-color: yellow;">22</td>
      <td style="background-color: yellow;">9</td>
      <td style="background-color: yellow;">23</td>
      <td style="background-color: yellow;">54</td>
    </tr>
  </tbody>
</table>

```sql
SELECT
    store_name,
    product,
    SUM(quantity) AS total
FROM dbo.fact_sales
WHERE sale_year = 2024
GROUP BY store_name, product WITH ROLLUP;
```

<table>
  <thead>
    <tr>
      <th>year=2024</th>
      <th>dunkin</th>
      <th>peets</th>
      <th>starbucks</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>coffee</th>
      <td style="background-color: yellow;">8</td>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">10</td>
      <td style="background-color: yellow;">21</td>
    </tr>
    <tr>
      <th>juice</th>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">1</td>
      <td style="background-color: yellow;">2</td>
      <td style="background-color: yellow;">6</td>
    </tr>
    <tr>
      <th>pastries</th>
      <td style="background-color: yellow;">6</td>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">5</td>
      <td style="background-color: yellow;">14</td>
    </tr>
    <tr>
      <th>sandwhich</th>
      <td style="background-color: yellow;">5</td>
      <td style="background-color: yellow;">2</td>
      <td style="background-color: yellow;">6</td>
      <td style="background-color: yellow;">13</td>
    </tr>
    <tr>
      <th>total</th>
      <td>22</td>
      <td>9</td>
      <td>23</td>
      <td style="background-color: yellow;">54</td>
    </tr>
  </tbody>
</table>

```sql
SELECT
    store_name,
    product,
    SUM(quantity) AS total
FROM dbo.fact_sales
WHERE sale_year = 2024
GROUP BY product, store_name WITH ROLLUP;
```

<table>
  <thead>
    <tr>
      <th>year=2024</th>
      <th>dunkin</th>
      <th>peets</th>
      <th>starbucks</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>coffee</th>
      <td style="background-color: yellow;">8</td>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">10</td>
      <td style="background-color: yellow;">21</td>
    </tr>
    <tr>
      <th>juice</th>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">1</td>
      <td style="background-color: yellow;">2</td>
      <td style="background-color: yellow;">6</td>
    </tr>
    <tr>
      <th>pastries</th>
      <td style="background-color: yellow;">6</td>
      <td style="background-color: yellow;">3</td>
      <td style="background-color: yellow;">5</td>
      <td style="background-color: yellow;">14</td>
    </tr>
    <tr>
      <th>sandwhich</th>
      <td style="background-color: yellow;">5</td>
      <td style="background-color: yellow;">2</td>
      <td style="background-color: yellow;">6</td>
      <td style="background-color: yellow;">13</td>
    </tr>
    <tr>
      <th>total</th>
      <td style="background-color: yellow;">22</td>
      <td style="background-color: yellow;">9</td>
      <td style="background-color: yellow;">23</td>
      <td style="background-color: yellow;">54</td>
    </tr>
  </tbody>
</table>

```sql
SELECT
    store_name,
    product,
    SUM(quantity) AS total
FROM dbo.fact_sales
WHERE sale_year = 2024
GROUP BY CUBE (store_name, product);
```

[The `CUBE` clause is particularly useful in data warehousing and reporting scenarios where you need to perform multi-dimensional analysis. It creates a grouping set for each combination of values in the specified columns, including all possible aggregations.](https://www.datacamp.com/doc/mysql/mysql-cube)

It is important to know the number of records to be stored when creating a data cube. A cube will produce a row for all possible combinations of the grouping dimensions. In our example, we have one dimension with a cardinality of 4 (product) and one dimension with a cardinality of 3 (store_name). We add the NULL value to each dimension (to factor in subtotals) and our result is (4 + 1)*(3 + 1) = 20 records.

An example of where `ROLLUP` is applicable, when grouping by year, month, day. If you group by year, then you want to group by all of the months of the year, and if you group by month, then you want to group by all of the days of the month. We don’t have to calculate the case where we group by month and sum all of the years, for example…..End product of the Rollup would be “GROUP BY year, month, day” union “GROUP BY year” that includes all months and all days union “GROUP BY year, month” which includes all days for a specific year and month


<table>
  <thead>
    <tr>
      <th>year=2024</th>
      <th>dunkin</th>
      <th>peets</th>
      <th>starbucks</th>
      <th>total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>coffee</th>
      <td>8</td>
      <td>3</td>
      <td>10</td>
      <td style="background-color: lightgreen;color: white">21</td>
    </tr>
    <tr>
      <th>juice</th>
      <td>3</td>
      <td>1</td>
      <td>2</td>
      <td>6</td>
    </tr>
    <tr>
      <th>pastries</th>
      <td>6</td>
      <td>3</td>
      <td>5</td>
      <td>14</td>
    </tr>
    <tr>
      <th>sandwhich</th>
      <td>5</td>
      <td>2</td>
      <td>6</td>
      <td>13</td>
    </tr>
    <tr>
      <th>total</th>
      <td>22</td>
      <td>9</td>
      <td>23</td>
      <td>54</td>
    </tr>
  </tbody>
</table>

```sql
SELECT
    SUM(quantity) AS total
FROM dbo.fact_sales
WHERE sale_year = 2024
AND product = 'coffee';
```
or 
```sql
SELECT total
FROM dbo.cube_sales
WHERE sale_year = 2024
AND product = 'coffee';
```

<table>
  <thead>
    <tr>
      <th>Sale Year</th>
      <th>Store</th>
      <th>Product</th>
      <th>Quantity</th>
    </tr>
  </thead>
  <tbody>
    <!-- 2024 -->
    <tr><td>2024</td><td>Starbucks</td><td>Coffee</td><td>10</td></tr>
    <tr><td>2024</td><td>Starbucks</td><td>Pastries</td><td>5</td></tr>
    <tr><td>2024</td><td>Starbucks</td><td>Sandwich</td><td>6</td></tr>
    <tr><td>2024</td><td>Starbucks</td><td>Juice</td><td>2</td></tr>
    <tr><td>2024</td><td>Peets</td><td>Coffee</td><td>3</td></tr>
    <tr><td>2024</td><td>Peets</td><td>Pastries</td><td>3</td></tr>
    <tr><td>2024</td><td>Peets</td><td>Sandwich</td><td>2</td></tr>
    <tr><td>2024</td><td>Peets</td><td>Juice</td><td>1</td></tr>
    <tr><td>2024</td><td>Dunkin</td><td>Coffee</td><td>8</td></tr>
    <tr><td>2024</td><td>Dunkin</td><td>Pastries</td><td>6</td></tr>
    <tr><td>2024</td><td>Dunkin</td><td>Sandwich</td><td>5</td></tr>
    <tr><td>2024</td><td>Dunkin</td><td>Juice</td><td>3</td></tr>
    <!-- 2023 -->
    <tr><td>2023</td><td>Starbucks</td><td>Coffee</td><td>8</td></tr>
    <tr><td>2023</td><td>Starbucks</td><td>Pastries</td><td>4</td></tr>
    <tr><td>2023</td><td>Starbucks</td><td>Sandwich</td><td>5</td></tr>
    <tr><td>2023</td><td>Starbucks</td><td>Juice</td><td>1</td></tr>
    <tr><td>2023</td><td>Peets</td><td>Coffee</td><td>2</td></tr>
    <tr><td>2023</td><td>Peets</td><td>Pastries</td><td>2</td></tr>
    <tr><td>2023</td><td>Peets</td><td>Sandwich</td><td>1</td></tr>
    <tr><td>2023</td><td>Peets</td><td>Juice</td><td>1</td></tr>
    <tr><td>2023</td><td>Dunkin</td><td>Coffee</td><td>6</td></tr>
    <tr><td>2023</td><td>Dunkin</td><td>Pastries</td><td>5</td></tr>
    <tr><td>2023</td><td>Dunkin</td><td>Sandwich</td><td>4</td></tr>
    <tr><td>2023</td><td>Dunkin</td><td>Juice</td><td>2</td></tr>
  </tbody>
</table>