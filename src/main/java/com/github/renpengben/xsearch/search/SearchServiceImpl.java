package com.github.renpengben.xsearch.search;

import jakarta.annotation.Resource;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class SearchServiceImpl implements SearchService {

  private static final Logger log = LoggerFactory.getLogger(SearchServiceImpl.class);

  @Resource
  private RestTemplate restTemplate;

  @Value("${keys.searchapi.key:}")
  private String searchApiKey;

  @Value("${keys.searchapi.engine:google}")
  private String engine;

  private static final int REFERENCE_COUNT = 8;

  @Override
  public List<SearchResponse> search(String query) {
    SearchApiResponse response = searchSearchApi(query);
    return response != null ? response.toContexts() : List.of();
  }

  private SearchApiResponse searchSearchApi(String query) {
    String uri = UriComponentsBuilder
        .newInstance()
        .scheme("https")
        .host("www.searchapi.io")
        .path("/api/v1/search")
        .queryParam("api_key", searchApiKey)
        .queryParam("q", query)
        .queryParam("engine", engine)
        .queryParam("num", REFERENCE_COUNT)
        .build()
        .toUriString();

    try {
      ResponseEntity<SearchApiResponse> response =
          restTemplate.getForEntity(uri, SearchApiResponse.class);

      if (response.getStatusCode().is2xxSuccessful()) {
        return response.getBody();
      } else {
        log.error("Search API request failed with status code: {}", response.getStatusCode());
        return null;
      }
    } catch (Exception e) {
      log.error("Error occurred while calling Search API: {}", e.getMessage(), e);
      return null;
    }
  }
}
