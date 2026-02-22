#!/usr/bin/env Rscript
library(dplyr)
library(lubridate)
library(httr2)
library(jsonlite)

fred_fetch <- function(series_id, start_date, end_date) {
  csv_url <- sprintf(
    "https://fred.stlouisfed.org/graph/fredgraph.csv?id=%s&cosd=%s&coed=%s",
    series_id, as.character(start_date), as.character(end_date)
  )
  
  dat <- read.csv(csv_url) |>
    tibble::as_tibble()
  
  # Get column names - should be DATE and series_id
  cols <- colnames(dat)
  date_col <- cols[1]
  value_col <- cols[2]
  
  dat |>
    rename(date = !!date_col, value = !!value_col) |>
    mutate(
      series_id = series_id,
      date = as.Date(date),
      value = as.numeric(value)
    ) |>
    select(series_id, date, value) |>
    arrange(date)
}

# Fetch 25 years of data
end_date <- floor_date(Sys.Date(), "month")
start_date <- end_date %m-% years(25)

cat("Fetching data from", as.character(start_date), "to", as.character(end_date), "\n\n")

# Fetch the three series
cpi_fred <- fred_fetch("CPIAUCSL", start_date, end_date) |> rename(cpi = value)
un_fred  <- fred_fetch("UNRATE",   start_date, end_date) |> rename(unemp = value)
ffr <- fred_fetch("FEDFUNDS", start_date, end_date) |> rename(ffr = value)

# Combine
df <- cpi_fred |>
  full_join(un_fred, by = "date") |>
  full_join(ffr, by = "date") |>
  select(date, cpi, unemp, ffr) |>
  arrange(date) |>
  mutate(
    infl_yoy = 100 * (cpi / lag(cpi, 12) - 1)
  )

# Filter for Dot-com period (2001-01-01 to 2003-12-01)
dotcom <- df |> 
  filter(date >= as.Date("2001-01-01"), date <= as.Date("2003-12-01"))

cat("\n=== DOT-COM PERIOD (2001-01-01 to 2003-12-01) ===\n\n")

cat("Fed Funds Rate (ffr):\n")
cat("  Min:", min(dotcom$ffr, na.rm = TRUE), "\n")
cat("  Max:", max(dotcom$ffr, na.rm = TRUE), "\n")
cat("  Range:", max(dotcom$ffr, na.rm = TRUE) - min(dotcom$ffr, na.rm = TRUE), "\n\n")

cat("Unemployment Rate (unemp):\n")
cat("  Min:", min(dotcom$unemp, na.rm = TRUE), "\n")
cat("  Max:", max(dotcom$unemp, na.rm = TRUE), "\n")
cat("  Range:", max(dotcom$unemp, na.rm = TRUE) - min(dotcom$unemp, na.rm = TRUE), "\n\n")

cat("Inflation YoY (infl_yoy):\n")
cat("  Min:", min(dotcom$infl_yoy, na.rm = TRUE), "\n")
cat("  Max:", max(dotcom$infl_yoy, na.rm = TRUE), "\n")
cat("  Range:", max(dotcom$infl_yoy, na.rm = TRUE) - min(dotcom$infl_yoy, na.rm = TRUE), "\n\n")

cat("=== DATA TABLE ===\n")
print(dotcom, n = Inf)
