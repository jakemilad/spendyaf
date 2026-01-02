1. buffer form data
2. Process CSV: clean names of merchants, remove payment recieved, parse floats and all that.
3. Grab list of unique merchants: this will be used to ask AI, but first we check our cache.
4. Grab list of cached merchant categories: select all merchant, category from the table that corresponds to a matching merchant. return the map. This is the first piece. This returns {merchant, category} for everything in the file that we've seen before
5. Find uncached merchants.
6.
