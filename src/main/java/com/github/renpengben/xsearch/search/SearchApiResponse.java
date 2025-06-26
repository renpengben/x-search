package com.github.renpengben.xsearch.search;


import static com.github.renpengben.xsearch.search.SearchService.REFERENCE_COUNT;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.github.renpengben.xsearch.search.SearchService.SearchResponse;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
class SearchApiResponse {

  @JsonProperty("organic_results")
  public List<Organic> organicResults;
  @JsonProperty("answer_box")
  public AnswerBox answerBox;
  @JsonProperty("knowledge_graph")
  public KnowledgeGraph knowledgeGraph;

  @Data
  @JsonIgnoreProperties(ignoreUnknown = true)
  static class Organic {

    public String title;
    public String link;
    public String snippet;
  }

  @Data
  @JsonIgnoreProperties(ignoreUnknown = true)
  static class AnswerBox {

    public String title;
    public String link;
    public String answer;
    public String snippet;
  }

  @Data
  @JsonIgnoreProperties(ignoreUnknown = true)
  static class KnowledgeGraph {

    public String title;
    public String website;
    public String description;
  }

  List<SearchResponse> toContexts() {
    List<SearchResponse> list = new ArrayList<>();
    if (answerBox != null && answerBox.link != null) {
      list.add(toContext(answerBox.title, answerBox.link,
          answerBox.snippet != null ? answerBox.snippet : answerBox.answer));
    }
    if (knowledgeGraph != null && knowledgeGraph.website != null) {
      list.add(toContext(knowledgeGraph.title, knowledgeGraph.website, knowledgeGraph.description));
    }
    if (organicResults != null) {
      organicResults.stream().limit(REFERENCE_COUNT)
          .forEach(o -> list.add(toContext(o.title, o.link, o.snippet)));
    }
    return list.subList(0, Math.min(REFERENCE_COUNT, list.size()));
  }

  private static SearchResponse toContext(String title, String url, String snippet) {
    return new SearchResponse(title, url, snippet);
  }
}

